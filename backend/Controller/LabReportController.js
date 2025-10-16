const LabReport = require('../Model/LabReportModel');
const LabRequest = require('../Model/LabRequestModel');
const Notification = require('../Model/NotificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const socketServer = require('../utils/socketServer');

// Create a new lab report
exports.createLabReport = catchAsync(async (req, res) => {
  console.log('\n🔬 ===== LAB REPORT CREATION STARTED =====');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User creating report:', req.user);
  
  // Add the user ID from the token as the createdBy field
  req.body.createdBy = req.user.id || req.user._id;
  
  const newReport = await LabReport.create(req.body);
  console.log('✅ Lab report created with ID:', newReport._id);
  
  // After successfully creating the lab report, update the corresponding lab request status
  if (req.body.labRequestId) {
    console.log('📋 Found associated lab request ID:', req.body.labRequestId);
    try {
      const labRequest = await LabRequest.findById(req.body.labRequestId).populate('patientId');
      
      if (labRequest) {
        console.log('✅ Lab request found:', {
          id: labRequest._id,
          patientId: labRequest.patientId,
          testType: labRequest.testType,
          currentStatus: labRequest.status
        });
        
        // Update the lab request status to 'completed'
        labRequest.status = 'completed';
        labRequest.completedAt = new Date();
        
        // Add entry to status history
        labRequest.statusHistory.push({
          status: 'completed',
          changedBy: req.user.id || req.user._id,
          timestamp: new Date(),
          notes: 'Lab report created - request completed'
        });
        
        await labRequest.save();
        console.log('✅ Lab request status updated to completed');
        
        // ✅ CREATE NOTIFICATION FOR THE PATIENT
        try {
          const patientUserId = labRequest.patientId._id || labRequest.patientId;
          console.log('🔔 Creating notification for patient:', patientUserId);
          
          const notificationData = {
            user: patientUserId,
            title: 'Lab Results Ready',
            message: `Your ${labRequest.testType} test results are now available. Click to view your report.`,
            type: 'info',
            read: false,
            relatedTo: {
              model: 'Test',
              id: labRequest._id
            }
          };
          
          console.log('🔔 Notification data:', JSON.stringify(notificationData, null, 2));
          
          const notification = new Notification(notificationData);
          await notification.save();
          
          console.log('✅ Notification saved to database with ID:', notification._id);
          console.log('✅ Lab completion notification created for patient:', patientUserId);
          
          // Send real-time notification via socket
          try {
            const patientIdStr = patientUserId.toString();
            socketServer.sendNotificationToUser(patientIdStr, notification);
            console.log('✅ Real-time notification sent to patient via socket');
          } catch (socketError) {
            console.error('⚠️ Socket notification failed (will still show in dropdown):', socketError.message);
          }
        } catch (notificationError) {
          console.error('❌ Failed to create notification:', notificationError);
          console.error('Error details:', notificationError.message);
          console.error('Error stack:', notificationError.stack);
          // Don't fail the entire request if notification fails
        }
      } else {
        console.warn('⚠️ Lab request not found for ID:', req.body.labRequestId);
      }
    } catch (labRequestError) {
      // Log the error but don't fail the lab report creation
      console.error('❌ Error updating lab request status:', labRequestError);
      console.error('Error details:', labRequestError.message);
      // Lab report was still created successfully, so we continue
    }
  } else {
    console.warn('⚠️ No labRequestId provided in request body');
  }
  
  console.log('===== LAB REPORT CREATION COMPLETED =====\n');
  
  res.status(201).json({
    success: true,
    message: 'Lab report created successfully',
    data: newReport
  });
});

// Get all lab reports (with pagination and filtering)
exports.getAllLabReports = catchAsync(async (req, res) => {
  // Get query parameters for filtering
  const { patientId, labRequestId, page = 1, limit = 10 } = req.query;
  
  // Build query object
  const queryObj = {};
  
  // If user is a patient, restrict to their own reports only
  if (req.user.role === 'patient') {
    queryObj.patientId = req.user.id || req.user._id;
  } else {
    // For other roles, allow filtering by patientId if provided
    if (patientId) queryObj.patientId = patientId;
  }
  
  if (labRequestId) queryObj.labRequestId = labRequestId;
  
  // Calculate skip value for pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Find reports based on query params and apply pagination
  const reports = await LabReport.find(queryObj)
    .sort({ createdAt: -1 }) // Sort by most recent first
    .skip(skip)
    .limit(parseInt(limit))
    .populate('createdBy', 'name')
    .populate('labRequestId');
  
  // Count total records for pagination info
  const totalReports = await LabReport.countDocuments(queryObj);
  
  res.status(200).json({
    success: true,
    count: reports.length,
    total: totalReports,
    pages: Math.ceil(totalReports / parseInt(limit)),
    currentPage: parseInt(page),
    data: reports
  });
});

// Get a single lab report by ID
exports.getLabReportById = catchAsync(async (req, res, next) => {
  const report = await LabReport.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('labRequestId');
  
  if (!report) {
    return next(new AppError('No lab report found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    data: report
  });
});

// Update a lab report - ONLY ALLOWED WITHIN 20 MINUTES OF CREATION
exports.updateLabReport = catchAsync(async (req, res, next) => {
  const report = await LabReport.findById(req.params.id);
  
  if (!report) {
    return next(new AppError('No lab report found with that ID', 404));
  }
  
  // Check if the report was created within the last 20 minutes
  if (!report.canUpdate()) {
    return next(new AppError('Updates are only allowed within 20 minutes of creation', 403));
  }
  
  // Update the report with new data
  const updatedReport = await LabReport.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'Lab report updated successfully',
    data: updatedReport
  });
});

// Delete a lab report
exports.deleteLabReport = catchAsync(async (req, res, next) => {
  console.log('Delete report request received for ID:', req.params.id);
  
  // Check if associated lab request exists and validate access
  try {
    const report = await LabReport.findById(req.params.id);
    if (!report) {
      console.log('No report found with ID:', req.params.id);
      return next(new AppError('No lab report found with that ID', 404));
    }
    
    console.log('Found report:', report);
    
    // Delete the report
    const deletedReport = await LabReport.findByIdAndDelete(req.params.id);
    console.log('Report deleted successfully');
    
    // Respond with success
    res.status(200).json({
      success: true,
      message: 'Lab report deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error in deleteLabReport:', error);
    next(error);
  }
});