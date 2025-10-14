const ShiftSchedule = require('../Model/ShiftScheduleModel');
const Staff = require('../Model/StaffModel');
const Department = require('../Model/DepartmentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const PDFDocument = require('pdfkit');

// Get schedules for a specific week
const getSchedulesByWeek = catchAsync(async (req, res, next) => {
  const { weekStartDate, departmentId } = req.query;
  
  if (!weekStartDate) {
    return next(new AppError('Week start date is required', 400));
  }

  const startDate = new Date(weekStartDate);
  
  // Validate date
  if (isNaN(startDate.getTime())) {
    return next(new AppError('Invalid date format', 400));
  }

  const schedules = await ShiftSchedule.getSchedulesByWeek(startDate, departmentId);

  res.status(200).json({
    status: 'success',
    data: {
      schedules,
      weekStartDate: startDate,
      departmentId: departmentId || null
    }
  });
});

// Create or update schedule for a staff member
const createOrUpdateSchedule = catchAsync(async (req, res, next) => {
  const { staffId, departmentId, weekStartDate, schedule, notes } = req.body;

  if (!staffId || !departmentId || !weekStartDate || !schedule) {
    return next(new AppError('Staff ID, department ID, week start date, and schedule are required', 400));
  }

  // Verify staff exists and belongs to department
  const staff = await Staff.findById(staffId);
  if (!staff) {
    return next(new AppError('Staff member not found', 404));
  }

  if (staff.departmentId.toString() !== departmentId) {
    return next(new AppError('Staff member does not belong to the specified department', 400));
  }

  const startDate = new Date(weekStartDate);
  
  // Check if schedule already exists
  let existingSchedule = await ShiftSchedule.findOne({
    staffId,
    weekStartDate: startDate
  });

  if (existingSchedule) {
    // Check if schedule is published
    if (existingSchedule.isPublished) {
      return next(new AppError('Cannot modify published schedule', 403));
    }

    // Update existing schedule
    existingSchedule.schedule = schedule;
    existingSchedule.notes = notes || existingSchedule.notes;
    existingSchedule.lastModifiedBy = req.user.id;
    
    await existingSchedule.save();

    const updatedSchedule = await ShiftSchedule.findById(existingSchedule._id)
      .populate('staffId', 'firstName lastName email position')
      .populate('departmentId', 'name')
      .populate('lastModifiedBy', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      data: {
        schedule: updatedSchedule
      }
    });
  } else {
    // Create new schedule
    const newSchedule = await ShiftSchedule.create({
      staffId,
      departmentId,
      weekStartDate: startDate,
      schedule,
      notes: notes || '',
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    });

    const populatedSchedule = await ShiftSchedule.findById(newSchedule._id)
      .populate('staffId', 'firstName lastName email position')
      .populate('departmentId', 'name')
      .populate('createdBy', 'firstName lastName')
      .populate('lastModifiedBy', 'firstName lastName');

    res.status(201).json({
      status: 'success',
      data: {
        schedule: populatedSchedule
      }
    });
  }
});

// Bulk update schedules
const bulkUpdateSchedules = catchAsync(async (req, res, next) => {
  const { schedules } = req.body;

  if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
    return next(new AppError('Schedules array is required', 400));
  }

  // Validate that all schedules have required fields
  for (const schedule of schedules) {
    if (!schedule.staffId || !schedule.weekStartDate || !schedule.schedule) {
      return next(new AppError('Each schedule must have staffId, weekStartDate, and schedule', 400));
    }
  }

  // Fetch all staff members to get their departments
  const staffIds = schedules.map(s => s.staffId);
  const staffMembers = await Staff.find({ _id: { $in: staffIds } });
  
  if (staffMembers.length !== staffIds.length) {
    return next(new AppError('Some staff members not found', 404));
  }

  // Create a map of staffId to staff department
  const staffDepartmentMap = {};
  for (const staff of staffMembers) {
    staffDepartmentMap[staff._id.toString()] = staff.department;
  }

  // Get department IDs from department names
  const departmentNames = [...new Set(Object.values(staffDepartmentMap))];
  const departments = await Department.find({ name: { $in: departmentNames.map(n => new RegExp(`^${n}$`, 'i')) } });
  
  const departmentNameToIdMap = {};
  departments.forEach(dept => {
    departmentNameToIdMap[dept.name.toLowerCase()] = dept._id;
  });

  // Check if any of the schedules are published
  const weekStartDate = new Date(schedules[0].weekStartDate);
  
  const existingSchedules = await ShiftSchedule.find({
    staffId: { $in: staffIds },
    weekStartDate,
    isPublished: true
  });

  if (existingSchedules.length > 0) {
    return next(new AppError('Cannot modify published schedules', 403));
  }

  // Prepare schedules for bulk upsert with calculated weekEndDate and looked-up departmentId
  const schedulesToUpsert = schedules.map(schedule => {
    const startDate = new Date(schedule.weekStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const departmentName = staffDepartmentMap[schedule.staffId];
    const departmentId = departmentNameToIdMap[departmentName?.toLowerCase()];
    
    if (!departmentId) {
      throw new Error(`Department not found for staff ${schedule.staffId} with department ${departmentName}`);
    }
    
    return {
      staffId: schedule.staffId,
      departmentId: departmentId,
      weekStartDate: startDate,
      weekEndDate: endDate,
      schedule: schedule.schedule,
      notes: schedule.notes || '',
      createdBy: req.user.id,
      lastModifiedBy: req.user.id
    };
  });

  try {
    const result = await ShiftSchedule.bulkUpsertSchedules(schedulesToUpsert, req.user.id);

    // Fetch updated schedules
    const updatedSchedules = await ShiftSchedule.getSchedulesByWeek(weekStartDate, null);

    res.status(200).json({
      status: 'success',
      data: {
        schedules: updatedSchedules,
        modifiedCount: result.modifiedCount || 0,
        upsertedCount: result.upsertedCount || 0
      }
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return next(new AppError(`Failed to update schedules: ${error.message}`, 500));
  }
});

// Publish schedules for a week
const publishSchedules = catchAsync(async (req, res, next) => {
  const { weekStartDate, departmentId } = req.body;

  if (!weekStartDate) {
    return next(new AppError('Week start date is required', 400));
  }

  const startDate = new Date(weekStartDate);
  const query = { weekStartDate: startDate };
  
  if (departmentId) {
    query.departmentId = departmentId;
  }

  // Find all schedules for the week
  const schedules = await ShiftSchedule.find(query).populate('staffId', 'firstName lastName email');

  console.log(`Found ${schedules.length} schedules for week ${startDate.toISOString().split('T')[0]}, department: ${departmentId || 'ALL'}`);
  
  if (schedules.length === 0) {
    return next(new AppError('No schedules found for the specified week', 404));
  }

  // Check if any are already published
  const alreadyPublished = schedules.filter(s => s.isPublished);
  if (alreadyPublished.length > 0) {
    // If all schedules are already published, return success with current data
    if (alreadyPublished.length === schedules.length) {
      const publishedSchedules = await ShiftSchedule.getSchedulesByWeek(startDate, departmentId);
      return res.status(200).json({
        status: 'success',
        message: 'All schedules are already published',
        data: {
          schedules: publishedSchedules,
          publishedCount: schedules.length
        }
      });
    } else {
      // Only some schedules are published - this is an inconsistent state
      return next(new AppError(`${alreadyPublished.length} out of ${schedules.length} schedules are already published. Please unpublish existing schedules first or contact administrator.`, 400));
    }
  }

  // Publish all schedules
  const publishPromises = schedules.map(schedule => schedule.publish(req.user.id));
  await Promise.all(publishPromises);

  // Notify staff members about the published schedule
  try {
    await notifyStaffAboutSchedule(schedules, startDate);
  } catch (notificationError) {
    console.error('Error sending notifications:', notificationError);
    // Don't fail the request if notifications fail, just log the error
  }

  // Fetch updated schedules
  const publishedSchedules = await ShiftSchedule.getSchedulesByWeek(startDate, departmentId);

  res.status(200).json({
    status: 'success',
    data: {
      schedules: publishedSchedules,
      publishedCount: schedules.length
    }
  });
});

// Helper function to notify staff about published schedules
const notifyStaffAboutSchedule = async (schedules, weekStartDate) => {
  const endDate = new Date(weekStartDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const weekRange = `${weekStartDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  
  // In a real application, you would implement email notifications here
  // For now, we'll just log the notifications that would be sent
  schedules.forEach(schedule => {
    const staffName = `${schedule.staffId.firstName} ${schedule.staffId.lastName}`;
    const staffEmail = schedule.staffId.email;
    
    console.log(`Notification would be sent to ${staffName} (${staffEmail}):`);
    console.log(`Subject: Your Schedule for Week ${weekRange}`);
    console.log(`Schedule details:`, schedule.schedule);
    console.log('---');
  });
  
  // You can implement actual email sending here using services like:
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP
  // Example:
  // const emailPromises = schedules.map(schedule => sendScheduleEmail(schedule, weekRange));
  // await Promise.all(emailPromises);
};

// Unpublish schedules (admin override)
const unpublishSchedules = catchAsync(async (req, res, next) => {
  const { weekStartDate, departmentId } = req.body;

  if (!weekStartDate) {
    return next(new AppError('Week start date is required', 400));
  }

  const startDate = new Date(weekStartDate);
  const query = { weekStartDate: startDate, isPublished: true };
  
  if (departmentId) {
    query.departmentId = departmentId;
  }

  // Find all published schedules for the week
  const schedules = await ShiftSchedule.find(query);

  if (schedules.length === 0) {
    return next(new AppError('No published schedules found for the specified week', 404));
  }

  // Unpublish all schedules
  const unpublishPromises = schedules.map(schedule => schedule.unpublish());
  await Promise.all(unpublishPromises);

  // Fetch updated schedules
  const unpublishedSchedules = await ShiftSchedule.getSchedulesByWeek(startDate, departmentId);

  res.status(200).json({
    status: 'success',
    data: {
      schedules: unpublishedSchedules,
      unpublishedCount: schedules.length
    }
  });
});

// Delete schedule
const deleteSchedule = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const schedule = await ShiftSchedule.findById(id);

  if (!schedule) {
    return next(new AppError('Schedule not found', 404));
  }

  if (schedule.isPublished) {
    return next(new AppError('Cannot delete published schedule', 403));
  }

  await ShiftSchedule.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get staff availability summary
const getStaffAvailability = catchAsync(async (req, res, next) => {
  const { weekStartDate } = req.query;

  if (!weekStartDate) {
    return next(new AppError('Week start date is required', 400));
  }

  const startDate = new Date(weekStartDate);

  // Get all departments
  const departments = await Department.find({ isActive: true });

  const availabilityData = await Promise.all(
    departments.map(async (department) => {
      // Get total staff in department
      const totalStaff = await Staff.countDocuments({ 
        departmentId: department._id,
        isActive: true
      });

      // Get scheduled staff for this week
      const scheduledStaff = await ShiftSchedule.countDocuments({
        departmentId: department._id,
        weekStartDate: startDate
      });

      // Calculate availability
      const availableStaff = Math.max(0, totalStaff - scheduledStaff);
      const availabilityPercentage = totalStaff > 0 ? (availableStaff / totalStaff) * 100 : 0;

      return {
        department: department.name,
        departmentId: department._id,
        totalStaff,
        scheduledStaff,
        availableStaff,
        availabilityPercentage: Math.round(availabilityPercentage * 10) / 10
      };
    })
  );

  res.status(200).json({
    status: 'success',
    data: {
      weekStartDate: startDate,
      departments: availabilityData
    }
  });
});

// Export schedule as PDF
const exportSchedulePDF = catchAsync(async (req, res, next) => {
  console.log('[PDF Export] Starting PDF export...');
  console.log('[PDF Export] Query params:', req.query);
  console.log('[PDF Export] User:', req.user ? { id: req.user.id, role: req.user.role } : 'No user');

  const { weekStartDate, departmentId } = req.query;

  if (!weekStartDate) {
    console.log('[PDF Export] ERROR: No weekStartDate provided');
    return next(new AppError('Week start date is required', 400));
  }

  const startDate = new Date(weekStartDate);
  console.log('[PDF Export] Start date:', startDate);
  
  // Create date range to handle timezone issues
  // The dates in DB are stored with +5:30 timezone offset (18:30 UTC for local midnight)
  // So we need a wider range to capture all possible timezones
  const startOfDay = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // Start 1 day before
  const endOfDay = new Date(startDate.getTime() + 48 * 60 * 60 * 1000);   // End 2 days after
  
  console.log('[PDF Export] Date range:', startOfDay.toISOString(), 'to', endOfDay.toISOString());
  console.log('[PDF Export] Target date in DB format would be:', new Date(startDate.getTime() + 18.5 * 60 * 60 * 1000).toISOString());
  
  // Try to get published schedules first, then fall back to all schedules
  let schedules = await ShiftSchedule.find({ 
    weekStartDate: { $gte: startOfDay, $lt: endOfDay },
    isPublished: true,
    ...(departmentId && { departmentId })
  }).populate('staffId', 'firstName lastName email position')
    .populate('departmentId', 'name');
  
  console.log('[PDF Export] Published schedules found:', schedules.length);
  
  if (schedules.length === 0) {
    // If no published schedules, get all schedules for the week
    schedules = await ShiftSchedule.find({ 
      weekStartDate: { $gte: startOfDay, $lt: endOfDay },
      ...(departmentId && { departmentId })
    }).populate('staffId', 'firstName lastName email position')
      .populate('departmentId', 'name');
    console.log('[PDF Export] Total schedules found:', schedules.length);
    
    // If still no schedules, log what dates actually exist
    if (schedules.length === 0) {
      const allDates = await ShiftSchedule.find({}).distinct('weekStartDate');
      console.log('[PDF Export] Available dates in DB:');
      allDates.forEach(date => {
        console.log('[PDF Export] - ', date.toISOString());
      });
    }
  } else {
    // Even if we found published schedules, also get unpublished ones for complete export
    const allSchedules = await ShiftSchedule.find({ 
      weekStartDate: { $gte: startOfDay, $lt: endOfDay },
      ...(departmentId && { departmentId })
    }).populate('staffId', 'firstName lastName email position')
      .populate('departmentId', 'name');
    
    console.log('[PDF Export] Total schedules (published + unpublished):', allSchedules.length);
    
    // Use all schedules for complete PDF export
    schedules = allSchedules;
  }

  if (schedules.length === 0) {
    console.log('[PDF Export] ERROR: No schedules found');
    return next(new AppError('No schedules found for export', 404));
  }

  console.log('[PDF Export] Final schedule count for PDF:', schedules.length);
  schedules.forEach((schedule, index) => {
    console.log(`[PDF Export] Schedule ${index + 1}: ${schedule.staffId.firstName} ${schedule.staffId.lastName} - Published: ${schedule.isPublished}`);
  });

  console.log(`[PDF Export] Exporting PDF for ${schedules.length} schedules`);

  try {
    // Create PDF document with larger page size for table
    const doc = new PDFDocument({ 
      margin: 30,
      size: 'A4',
      layout: 'landscape' // Use landscape for better table width
    });
    
    console.log('[PDF Export] PDF document created');
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="shift-schedule-${startDate.toISOString().split('T')[0]}.pdf"`);

    console.log('[PDF Export] Headers set, piping to response...');
    
    // Pipe PDF to response
    doc.pipe(res);

  // Add title and header info
  doc.fontSize(18).text('Shift Schedule', { align: 'center' });
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  doc.fontSize(12).text(`Week: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
  
  if (departmentId) {
    const deptName = schedules[0]?.departmentId?.name || 'Selected Department';
    doc.text(`Department: ${deptName}`, { align: 'center' });
  }
  
  doc.moveDown(1);

  // Group schedules by department
  const departmentGroups = {};
  schedules.forEach(schedule => {
    const deptName = schedule.departmentId.name;
    if (!departmentGroups[deptName]) {
      departmentGroups[deptName] = [];
    }
    departmentGroups[deptName].push(schedule);
  });

  // Create table for each department
  Object.keys(departmentGroups).forEach((deptName, deptIndex) => {
    if (deptIndex > 0) {
      doc.addPage(); // New page for each department if multiple
    }

    // Department header (only show if multiple departments)
    if (Object.keys(departmentGroups).length > 1) {
      doc.fontSize(14).text(deptName, { align: 'left', underline: true });
      doc.moveDown(0.5);
    }

    // Table setup
    const tableTop = doc.y;
    const leftMargin = 30;
    const tableWidth = doc.page.width - 60; // Account for margins
    
    // Column widths
    const staffColumnWidth = 120;
    const dayColumnWidth = (tableWidth - staffColumnWidth) / 7; // 7 days
    
    // Days of the week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Helper function to draw table borders
    const drawTableBorder = (x, y, width, height) => {
      doc.rect(x, y, width, height).stroke();
    };

    // Helper function to get shift abbreviation and color
    const getShiftDisplay = (shift) => {
      switch (shift) {
        case 'morning': return { text: 'Morning', bg: '#4FC3F7', border: '#0288D1' }; // Bright blue
        case 'evening': return { text: 'Evening', bg: '#81C784', border: '#388E3C' }; // Bright green
        case 'night': return { text: 'Night', bg: '#BA68C8', border: '#7B1FA2' }; // Bright purple
        case 'on-call': return { text: 'On Call', bg: '#FFB74D', border: '#F57F17' }; // Bright orange
        case 'off-duty': return { text: 'Off Duty', bg: '#E0E0E0', border: '#757575' }; // Light gray
        default: return { text: shift, bg: '#FFFFFF', border: '#000000' };
      }
    };

    let currentY = tableTop;
    const rowHeight = 30;

    // Draw header row
    doc.fontSize(10).font('Helvetica-Bold');
    
    // Staff/Day header cell
    drawTableBorder(leftMargin, currentY, staffColumnWidth, rowHeight);
    doc.fillColor('#F0F0F0').rect(leftMargin, currentY, staffColumnWidth, rowHeight).fill();
    doc.fillColor('black').text('STAFF / DAY', leftMargin + 5, currentY + 10, {
      width: staffColumnWidth - 10,
      align: 'center'
    });

    // Day header cells
    days.forEach((day, index) => {
      const dayX = leftMargin + staffColumnWidth + (index * dayColumnWidth);
      drawTableBorder(dayX, currentY, dayColumnWidth, rowHeight);
      doc.fillColor('#F0F0F0').rect(dayX, currentY, dayColumnWidth, rowHeight).fill();
      doc.fillColor('black').text(day.toUpperCase(), dayX + 5, currentY + 5, {
        width: dayColumnWidth - 10,
        align: 'center'
      });
      
      // Add date below day name
      const dayDate = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
      doc.fontSize(8).text(dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        dayX + 5, currentY + 18, {
        width: dayColumnWidth - 10,
        align: 'center'
      });
    });

    currentY += rowHeight;

    // Draw staff rows
    doc.font('Helvetica').fontSize(9);
    
    departmentGroups[deptName].forEach((schedule, rowIndex) => {
      const staffName = `${schedule.staffId.firstName} ${schedule.staffId.lastName}`;
      const isEvenRow = rowIndex % 2 === 0;
      
      // Staff name cell
      drawTableBorder(leftMargin, currentY, staffColumnWidth, rowHeight);
      if (isEvenRow) {
        doc.fillColor('#FAFAFA').rect(leftMargin, currentY, staffColumnWidth, rowHeight).fill();
      }
      
      // Add staff initials circle (like in the UI)
      const initialsX = leftMargin + 10;
      const initialsY = currentY + 8;
      const circleRadius = 8;
      
      doc.fillColor('#2196F3').circle(initialsX + circleRadius, initialsY + circleRadius, circleRadius).fill();
      doc.fillColor('white').fontSize(8).text(
        `${schedule.staffId.firstName.charAt(0)}${schedule.staffId.lastName.charAt(0)}`,
        initialsX + 4, initialsY + 5
      );
      
      // Staff name and role
      doc.fillColor('black').fontSize(9).text(staffName, leftMargin + 35, currentY + 8, {
        width: staffColumnWidth - 40,
        ellipsis: true
      });
      doc.fontSize(7).fillColor('#666').text(schedule.staffId.position || 'Staff', leftMargin + 35, currentY + 20, {
        width: staffColumnWidth - 40,
        ellipsis: true
      });

      // Day cells
      dayKeys.forEach((dayKey, index) => {
        const dayX = leftMargin + staffColumnWidth + (index * dayColumnWidth);
        const shift = schedule.schedule[dayKey];
        const shiftDisplay = getShiftDisplay(shift);
        
        drawTableBorder(dayX, currentY, dayColumnWidth, rowHeight);
        
        // Fill cell with vibrant shift color
        if (shift !== 'off-duty') {
          doc.fillColor(shiftDisplay.bg).rect(dayX, currentY, dayColumnWidth, rowHeight).fill();
          // Add colored border for better visibility
          doc.strokeColor(shiftDisplay.border).rect(dayX, currentY, dayColumnWidth, rowHeight).stroke();
        } else if (isEvenRow) {
          doc.fillColor('#FAFAFA').rect(dayX, currentY, dayColumnWidth, rowHeight).fill();
          doc.strokeColor('#000000').rect(dayX, currentY, dayColumnWidth, rowHeight).stroke();
        } else {
          doc.strokeColor('#000000').rect(dayX, currentY, dayColumnWidth, rowHeight).stroke();
        }
        
        // Add shift text with contrasting color
        const textColor = (shift === 'off-duty') ? '#000000' : '#000000';
        doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold').text(shiftDisplay.text, dayX + 3, currentY + 11, {
          width: dayColumnWidth - 6,
          align: 'center'
        });
      });

      currentY += rowHeight;
    });

    // Add legend
    doc.moveDown(1);
    currentY += 15;
    doc.fontSize(10).font('Helvetica-Bold').text('Legend:', leftMargin, currentY);
    currentY += 15;

    const legendItems = [
      { label: 'Morning', color: '#4FC3F7', border: '#0288D1' },
      { label: 'Evening', color: '#81C784', border: '#388E3C' },
      { label: 'Night', color: '#BA68C8', border: '#7B1FA2' },
      { label: 'On Call', color: '#FFB74D', border: '#F57F17' },
      { label: 'Off Duty', color: '#E0E0E0', border: '#757575' }
    ];

    legendItems.forEach((item, index) => {
      const legendX = leftMargin + (index * 110);
      const legendY = currentY;
      
      // Larger, more prominent color box
      const boxSize = 16;
      doc.fillColor(item.color).rect(legendX, legendY, boxSize, boxSize).fill();
      doc.strokeColor(item.border).lineWidth(2).rect(legendX, legendY, boxSize, boxSize).stroke();
      
      // Label with better formatting
      doc.fillColor('black').fontSize(9).font('Helvetica-Bold').text(item.label, legendX + boxSize + 6, legendY + 3);
    });
  });

  // Add footer
  doc.fontSize(8).fillColor('#666').text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 
    0, doc.page.height - 30, { 
      align: 'center',
      width: doc.page.width
    }
  );

  // Finalize PDF
  doc.end();
  console.log('[PDF Export] PDF generation completed successfully');
  
  } catch (error) {
    console.error('[PDF Export] Error during PDF generation:', error);
    return next(new AppError('Failed to generate PDF', 500));
  }
});

// Get schedule statistics
const getScheduleStats = catchAsync(async (req, res, next) => {
  const { weekStartDate, departmentId } = req.query;

  if (!weekStartDate) {
    return next(new AppError('Week start date is required', 400));
  }

  const startDate = new Date(weekStartDate);
  const query = { weekStartDate: startDate };
  
  if (departmentId) {
    query.departmentId = departmentId;
  }

  const schedules = await ShiftSchedule.find(query);

  // Calculate statistics
  const stats = {
    totalSchedules: schedules.length,
    publishedSchedules: schedules.filter(s => s.isPublished).length,
    draftSchedules: schedules.filter(s => !s.isPublished).length,
    shiftDistribution: {
      morning: 0,
      evening: 0,
      night: 0,
      onCall: 0,
      offDuty: 0
    }
  };

  // Count shift types across all days
  schedules.forEach(schedule => {
    Object.values(schedule.schedule).forEach(shift => {
      switch (shift) {
        case 'morning':
          stats.shiftDistribution.morning++;
          break;
        case 'evening':
          stats.shiftDistribution.evening++;
          break;
        case 'night':
          stats.shiftDistribution.night++;
          break;
        case 'on-call':
          stats.shiftDistribution.onCall++;
          break;
        case 'off-duty':
          stats.shiftDistribution.offDuty++;
          break;
      }
    });
  });

  res.status(200).json({
    status: 'success',
    data: {
      weekStartDate: startDate,
      statistics: stats
    }
  });
});

module.exports = {
  getSchedulesByWeek,
  createOrUpdateSchedule,
  bulkUpdateSchedules,
  publishSchedules,
  unpublishSchedules,
  deleteSchedule,
  getStaffAvailability,
  exportSchedulePDF,
  getScheduleStats
};