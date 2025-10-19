import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, FilterIcon, RefreshCwIcon, PlusIcon, Download, XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

const ShiftScheduling = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [staffSchedules, setStaffSchedules] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [selectedStaffToAdd, setSelectedStaffToAdd] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/departments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.data.departments || []);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([
          { _id: 'cardiology', name: 'Cardiology' },
          { _id: 'neurology', name: 'Neurology' },
          { _id: 'pediatrics', name: 'Pediatrics' },
          { _id: 'emergency', name: 'Emergency' }
        ]);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const weekStart = getWeekStart(currentWeek);
        const params = new URLSearchParams({
          weekStartDate: weekStart.toISOString().split('T')[0]
        });
        
        if (selectedDepartment) {
          params.append('departmentId', selectedDepartment);
        }

        const response = await fetch(`${API_BASE_URL}/shift-schedules?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
          const data = await response.json();
          const schedules = data.data.schedules || [];
          
          // Create a map of staff schedules from server response
          const serverScheduleMap = new Map();
          schedules.forEach(schedule => {
            serverScheduleMap.set(schedule.staffId._id, {
              id: schedule._id,
              staffName: `${schedule.staffId.firstName} ${schedule.staffId.lastName}`,
              role: schedule.staffId.position,
              initials: getInitials(schedule.staffId.firstName, schedule.staffId.lastName),
              avatar: getRandomColor(),
              schedule: schedule.schedule,
              isPublished: schedule.isPublished,
              staffId: schedule.staffId._id,
<<<<<<< Updated upstream
              departmentId: schedule.departmentId._id || schedule.departmentId // Store department ID
=======
              departmentId: schedule.departmentId?._id || schedule.departmentId // Store department ID
>>>>>>> Stashed changes
            });
          });

          // Update existing staff schedules or maintain them with default schedule for new week
          setStaffSchedules(prevStaffSchedules => {
            // If this is the first load or department change, use server data
            if (prevStaffSchedules.length === 0) {
              return Array.from(serverScheduleMap.values());
            }
            
            // Update existing staff with new week data or default schedule
            return prevStaffSchedules.map(staff => {
              const serverSchedule = serverScheduleMap.get(staff.staffId || staff.id);
              if (serverSchedule) {
                // Staff has schedule for this week from server
                return {
                  ...staff,
                  schedule: serverSchedule.schedule,
                  isPublished: serverSchedule.isPublished,
                  departmentId: serverSchedule.departmentId // Update department ID
                };
              } else {
                // Staff doesn't have schedule for this week, use default
                return {
                  ...staff,
                  schedule: {
                    monday: 'off-duty',
                    tuesday: 'off-duty',
                    wednesday: 'off-duty',
                    thursday: 'off-duty',
                    friday: 'off-duty',
                    saturday: 'off-duty',
                    sunday: 'off-duty'
                  },
                  isPublished: false
                };
              }
            });
          });
          
          const hasPublished = schedules.some(s => s.isPublished);
          setIsPublished(hasPublished);
          setHasUnsavedChanges(false); // Reset unsaved changes when loading new data
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        // Only set fallback data if no existing staff schedules
        setStaffSchedules(prevSchedules => {
          if (prevSchedules.length === 0) {
            return [
              {
                id: 1,
                staffName: 'Dr. John Smith',
                role: 'Cardiologist',
                initials: 'JS',
                avatar: 'blue',
                schedule: {
                  monday: 'evening',
                  tuesday: 'night', 
                  wednesday: 'morning',
                  thursday: 'evening',
                  friday: 'on-call',
                  saturday: 'morning',
                  sunday: 'off-duty'
                }
              }
            ];
          }
          return prevSchedules;
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchAvailability = async () => {
      try {
        const weekStart = getWeekStart(currentWeek);
        const response = await fetch(`${API_BASE_URL}/shift-schedules/availability?weekStartDate=${weekStart.toISOString().split('T')[0]}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
          const data = await response.json();
          setAvailabilityData(data.data.departments || []);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        setAvailabilityData([
          { department: 'Cardiology', totalStaff: 10, availableStaff: 8, availabilityPercentage: 80 },
          { department: 'Neurology', totalStaff: 8, availableStaff: 5, availabilityPercentage: 62.5 }
        ]);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchSchedules(), fetchAvailability()]);
    };
    loadData();
  }, [currentWeek, selectedDepartment]); // Removed staffSchedules dependency to prevent infinite loop

  const handleDownloadPDF = () => {
    if (staffSchedules.length === 0) {
      alert('No schedules to download. Please add staff members first.');
      return;
    }

    const weekDates = getWeekDates(currentWeek);
    const weekRange = formatWeekRange(currentWeek);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shift Schedule - ${weekRange}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            padding: 30px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4f46e5;
          }
          .header h1 {
            color: #4f46e5;
            font-size: 28px;
            margin-bottom: 10px;
          }
          .header p {
            color: #666;
            font-size: 16px;
            margin: 5px 0;
          }
          .schedule-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
          }
          .info-item {
            font-size: 14px;
          }
          .info-item strong {
            color: #4f46e5;
            display: block;
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          thead {
            background: #4f46e5;
            color: white;
          }
          th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            border: 1px solid #e5e7eb;
          }
          td {
            padding: 10px 12px;
            border: 1px solid #e5e7eb;
            font-size: 12px;
          }
          tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          tbody tr:hover {
            background: #f3f4f6;
          }
          .staff-name {
            font-weight: 600;
            color: #1f2937;
          }
          .staff-role {
            color: #6b7280;
            font-size: 11px;
          }
          .shift-cell {
            text-align: center;
            font-weight: 500;
          }
          .shift-morning {
            background: #fef3c7;
            color: #92400e;
          }
          .shift-evening {
            background: #dbeafe;
            color: #1e40af;
          }
          .shift-night {
            background: #e0e7ff;
            color: #3730a3;
          }
          .shift-on-call {
            background: #fce7f3;
            color: #9f1239;
          }
          .shift-off-duty {
            background: #f3f4f6;
            color: #6b7280;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 10px;
          }
          .status-published {
            background: #dcfce7;
            color: #166534;
          }
          .status-draft {
            background: #fef3c7;
            color: #92400e;
          }
          @media print {
            body {
              padding: 15px;
            }
            .header h1 {
              font-size: 24px;
            }
            table {
              font-size: 11px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 Hospital Shift Schedule</h1>
          <p>Week: ${weekRange}</p>
          <p>
            Status: 
            <span class="status-badge ${isPublished ? 'status-published' : 'status-draft'}">
              ${isPublished ? '✓ Published' : '○ Draft'}
            </span>
          </p>
        </div>
        
        <div class="schedule-info">
          <div class="info-item">
            <strong>Total Staff</strong>
            ${staffSchedules.length} members
          </div>
          <div class="info-item">
            <strong>Department</strong>
            ${selectedDepartment ? departments.find(d => d._id === selectedDepartment)?.name || 'All Departments' : 'All Departments'}
          </div>
          <div class="info-item">
            <strong>Generated On</strong>
            ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 180px;">Staff Member</th>
              <th>Monday<br/><span style="font-weight: 400; font-size: 11px;">${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></th>
              <th>Tuesday<br/><span style="font-weight: 400; font-size: 11px;">${weekDates[1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></th>
              <th>Wednesday<br/><span style="font-weight: 400; font-size: 11px;">${weekDates[2].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></th>
              <th>Thursday<br/><span style="font-weight: 400; font-size: 11px;">${weekDates[3].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></th>
              <th>Friday<br/><span style="font-weight: 400; font-size: 11px;">${weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></th>
              <th>Saturday<br/><span style="font-weight: 400; font-size: 11px;">${weekDates[5].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></th>
              <th>Sunday<br/><span style="font-weight: 400; font-size: 11px;">${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></th>
            </tr>
          </thead>
          <tbody>
            ${staffSchedules.map(staff => `
              <tr>
                <td>
                  <div class="staff-name">${staff.staffName}</div>
                  <div class="staff-role">${staff.role || 'Staff'}</div>
                </td>
                ${['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                  const shift = staff.schedule[day] || 'off-duty';
                  const shiftDisplay = shift.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                  return `<td class="shift-cell shift-${shift}">${shiftDisplay}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Shift Legend:</strong></p>
          <p style="margin-top: 10px;">
            <span style="padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 4px; margin: 0 5px;">Morning</span>
            <span style="padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 4px; margin: 0 5px;">Evening</span>
            <span style="padding: 4px 12px; background: #e0e7ff; color: #3730a3; border-radius: 4px; margin: 0 5px;">Night</span>
            <span style="padding: 4px 12px; background: #fce7f3; color: #9f1239; border-radius: 4px; margin: 0 5px;">On Call</span>
            <span style="padding: 4px 12px; background: #f3f4f6; color: #6b7280; border-radius: 4px; margin: 0 5px;">Off Duty</span>
          </p>
          <p style="margin-top: 15px;">Generated from Hospital Management System</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
    };
  };

  const fetchAllStaff = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        const allStaff = data.data.staff || [];
        
        // Debug: Log staff data to see structure
        console.log('Fetched staff data:', allStaff.length > 0 ? allStaff[0] : 'No staff');
        
        // Filter out staff that are already in the schedule
        const existingStaffIds = staffSchedules.map(s => s.id);
        const availableStaffList = allStaff.filter(staff => !existingStaffIds.includes(staff._id));
        
        // Filter by selected department if any
        const filteredStaff = selectedDepartment 
          ? availableStaffList.filter(staff => {
              // Handle both populated and non-populated departmentId
              const staffDeptId = staff.departmentId?._id || staff.departmentId;
              return staffDeptId === selectedDepartment;
            })
          : availableStaffList;
          
        setAvailableStaff(filteredStaff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setAvailableStaff([]);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRandomColor = () => {
    const colors = ['blue', 'green', 'purple', 'yellow', 'red'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getWeekStart = (date) => {
    const week = new Date(date);
    const day = week.getDay();
    const diff = week.getDate() - day + (day === 0 ? -6 : 1);
    week.setDate(diff);
    week.setHours(0, 0, 0, 0);
    return week;
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatWeekRange = (date) => {
    const weekDates = getWeekDates(date);
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const handleScheduleChange = (staffId, day, shift) => {
    setStaffSchedules(schedules =>
      schedules.map(staff =>
        staff.id === staffId
          ? { ...staff, schedule: { ...staff.schedule, [day]: shift } }
          : staff
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleAddStaffClick = async () => {
    setShowStaffModal(true);
    await fetchAllStaff();
  };

  const handleAddSelectedStaff = () => {
    console.log('Adding staff to schedule:', selectedStaffToAdd);
    
    const newStaffSchedules = selectedStaffToAdd.map(staff => {
      return {
        id: staff._id,
        staffId: staff._id,
        // Don't send departmentId - backend will look it up from staff record
        staffName: `${staff.firstName} ${staff.lastName}`,
        role: staff.position || staff.role,
        department: staff.department, // Store for display purposes only
        initials: getInitials(staff.firstName, staff.lastName),
        avatar: getRandomColor(),
        schedule: {
          monday: 'off-duty',
          tuesday: 'off-duty',
          wednesday: 'off-duty',
          thursday: 'off-duty',
          friday: 'off-duty',
          saturday: 'off-duty',
          sunday: 'off-duty'
        }
      };
    });

    setStaffSchedules(prev => [...prev, ...newStaffSchedules]);
    setSelectedStaffToAdd([]);
    setShowStaffModal(false);
    setHasUnsavedChanges(true);
  };

  const handleRemoveStaff = (staffId) => {
    const confirmRemove = window.confirm('Are you sure you want to remove this staff member from the schedule?');
    if (confirmRemove) {
      setStaffSchedules(prev => prev.filter(staff => staff.id !== staffId && staff.staffId !== staffId));
      setHasUnsavedChanges(true);
    }
  };

  const handleStaffSelection = (staff, isSelected) => {
    if (isSelected) {
      setSelectedStaffToAdd(prev => [...prev, staff]);
    } else {
      setSelectedStaffToAdd(prev => prev.filter(s => s._id !== staff._id));
    }
  };

  // Function to refresh schedules from server without page reload
  // Currently not used to prevent table clearing, but kept for future use
  // eslint-disable-next-line no-unused-vars
  const refreshSchedules = async () => {
    try {
      const weekStart = getWeekStart(currentWeek);
      const params = new URLSearchParams({
        weekStartDate: weekStart.toISOString().split('T')[0]
      });
      
      if (selectedDepartment) {
        params.append('departmentId', selectedDepartment);
      }

      const response = await fetch(`${API_BASE_URL}/shift-schedules?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        const schedules = data.data.schedules || [];
        
        console.log('Refreshed schedules from server:', schedules.length);
        
        // Only update if we got data back, otherwise keep current schedules
        if (schedules.length > 0) {
          // Update staff schedules with fresh data from server
          const updatedSchedules = schedules.map(schedule => ({
            id: schedule._id,
            staffName: `${schedule.staffId.firstName} ${schedule.staffId.lastName}`,
            role: schedule.staffId.position,
            initials: getInitials(schedule.staffId.firstName, schedule.staffId.lastName),
            avatar: getRandomColor(),
            schedule: schedule.schedule,
            isPublished: schedule.isPublished,
            staffId: schedule.staffId._id,
            departmentId: schedule.departmentId._id || schedule.departmentId
          }));

          setStaffSchedules(updatedSchedules);
          
          const hasPublished = schedules.some(s => s.isPublished);
          setIsPublished(hasPublished);
        } else {
          console.log('No schedules returned from server - keeping current schedules');
          // Just update the published status based on current schedules
          const hasPublished = staffSchedules.some(s => s.isPublished);
          setIsPublished(hasPublished);
        }
      }
    } catch (error) {
      console.error('Error refreshing schedules:', error);
      // Keep current schedules on error
    }
  };

  const handleSaveChanges = async () => {
    if (staffSchedules.length === 0) {
      alert('No schedules to save.');
      return;
    }

    setLoading(true);
    try {
      // Don't send departmentId - backend will look it up from staff records
      const schedulesToSave = staffSchedules.map(staff => ({
        staffId: staff.staffId || staff.id,
        weekStartDate: getWeekStart(currentWeek).toISOString(),
        schedule: staff.schedule
      }));

      console.log('Saving schedules:', schedulesToSave);

      const response = await fetch(`${API_BASE_URL}/shift-schedules/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ schedules: schedulesToSave })
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          alert(`Schedule changes saved successfully! Updated ${data.data.modifiedCount || data.data.upsertedCount || schedulesToSave.length} schedules.`);
          console.log('Schedule changes saved successfully', data);
          
          // Reset unsaved changes indicator
          setHasUnsavedChanges(false);
          
          // Don't refresh - keep the current schedules to avoid clearing the table
          // The data is already saved to the database
          console.log('Schedules saved to database. Keeping current view.');
        } else {
          // Non-JSON response but still successful
          alert('Schedule changes saved successfully!');
          setHasUnsavedChanges(false);
        }
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          alert(`Failed to save changes: ${errorData.message || 'Unknown error'}`);
        } else {
          const textResponse = await response.text();
          console.error('HTML error response:', textResponse);
          
          if (response.status === 404) {
            alert('Failed to save changes: API endpoint not found. Please check if the backend server is running correctly.');
          } else if (response.status === 401) {
            alert('Failed to save changes: Unauthorized. Please log in again.');
          } else {
            alert(`Failed to save changes: Server returned ${response.status} error. Please try again.`);
          }
        }
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishRoster = async () => {
    // Check if there are any schedules to publish
    if (staffSchedules.length === 0) {
      alert('No staff schedules to publish. Please add staff members first.');
      return;
    }

    // Check if there are unsaved changes
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please click "Save Changes" button first before publishing the roster.');
      return;
    }

    // Confirm action with user
    const confirmPublish = window.confirm(
      isPublished 
        ? 'This roster is already published. Do you want to republish it with any updates?'
        : 'Are you sure you want to publish this roster? Staff will be notified about the schedule.'
    );
    
    if (!confirmPublish) return;

    setLoading(true);
    try {
      console.log('Publishing roster for:', {
        weekStartDate: getWeekStart(currentWeek).toISOString(),
        departmentId: selectedDepartment,
        staffCount: staffSchedules.length
      });

      const response = await fetch(`${API_BASE_URL}/shift-schedules/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          weekStartDate: getWeekStart(currentWeek).toISOString(),
          departmentId: selectedDepartment
        })
      });

      // Check if response is ok first
      if (response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          // Update all staff schedules to published state
          setStaffSchedules(prev => 
            prev.map(staff => ({ ...staff, isPublished: true }))
          );
          setIsPublished(true);
          
          // Show success message
          const message = data.message || `Roster published successfully! ${data.data.publishedCount} schedules have been published and staff will be notified.`;
          alert(message);
          console.log('Roster published successfully');
          
          // Automatically download PDF after successful publish
          setTimeout(() => {
            handleDownloadPDF();
          }, 500);
        } else {
          // Response is not JSON, get text content
          const textResponse = await response.text();
          console.error('Non-JSON response:', textResponse);
          alert('Roster published but received unexpected response format. Please refresh the page.');
        }
      } else {
        // Handle error responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('Publish error:', errorData);
          
          // Handle specific error cases
          if (errorData.message && errorData.message.includes('already published')) {
            // Some or all schedules are already published
            setIsPublished(true);
            setStaffSchedules(prev => 
              prev.map(staff => ({ ...staff, isPublished: true }))
            );
            alert(`Roster is already published: ${errorData.message}`);
          } else if (errorData.message && errorData.message.includes('No schedules found')) {
            // No schedules in database for this week
            alert(`Failed to publish roster: No schedules found in the database for this week.\n\nPlease make sure to:\n1. Add staff members to the schedule\n2. Assign shifts to them\n3. Click "Save Changes" button to save to database\n4. Then click "Publish Roster"`);
          } else {
            alert(`Failed to publish roster: ${errorData.message || 'Unknown error'}`);
          }
        } else {
          // Error response is HTML (likely 404 or 500 page)
          const textResponse = await response.text();
          console.error('HTML error response:', textResponse);
          
          if (response.status === 404) {
            alert('Failed to publish roster: API endpoint not found. Please check if the backend server is running correctly.');
          } else if (response.status === 500) {
            alert('Failed to publish roster: Server error. Please check the backend logs.');
          } else if (response.status === 401) {
            alert('Failed to publish roster: Unauthorized. Please log in again.');
            // Optionally redirect to login
          } else {
            alert(`Failed to publish roster: Server returned ${response.status} error. Please try again.`);
          }
        }
      }
    } catch (error) {
      console.error('Error publishing roster:', error);
      alert('Failed to publish roster. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  /* Unpublish functionality removed - schedules are now always editable
  const handleUnpublishRoster = async () => {
    const confirmUnpublish = window.confirm(
      'Are you sure you want to unpublish this roster? This will allow editing again but staff notifications will be revoked.'
    );
    
    if (!confirmUnpublish) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/shift-schedules/unpublish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          weekStartDate: getWeekStart(currentWeek).toISOString(),
          departmentId: selectedDepartment
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsPublished(false);
        
        // Update all staff schedules to unpublished state
        setStaffSchedules(prev => 
          prev.map(staff => ({ ...staff, isPublished: false }))
        );
        
        alert(`Roster unpublished successfully! ${data.data.unpublishedCount} schedules are now editable again.`);
        console.log('Roster unpublished successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to unpublish roster: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error unpublishing roster:', error);
      alert('Failed to unpublish roster. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  */

  /* Backend PDF export - using client-side PDF generation instead
  const handleExportPDF = async () => {
    try {
      // First, save all current schedules to ensure PDF has latest data
      if (staffSchedules.length > 0) {
        console.log('Saving schedules before PDF export...', {
          staffCount: staffSchedules.length,
          selectedDepartment,
          weekStart: getWeekStart(currentWeek).toISOString()
        });
        
        setLoading(true);
        
        // Fetch staff details to get department info if not available
        const staffIds = staffSchedules.map(s => s.staffId || s.id).filter(Boolean);
        let staffDetailsMap = new Map();
        
        if (!selectedDepartment && staffIds.length > 0) {
          try {
            const staffResponse = await fetch(`${API_BASE_URL}/staff`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (staffResponse.ok) {
              const staffData = await staffResponse.json();
              const allStaff = staffData.data.staff || [];
              
              allStaff.forEach(staff => {
                staffDetailsMap.set(staff._id, staff);
              });
            }
          } catch (error) {
            console.error('Error fetching staff details:', error);
          }
        }
        
        // Find or use the selected department ID
        let departmentIdToUse = selectedDepartment;
        
        // If no department selected, try to get it from the first staff member
        if (!departmentIdToUse && staffSchedules.length > 0) {
          // Try from existing schedule data
          const firstScheduleWithDept = staffSchedules.find(s => s.departmentId);
          if (firstScheduleWithDept) {
            departmentIdToUse = firstScheduleWithDept.departmentId;
          } else {
            // Try from staff details
            const firstStaffId = staffSchedules[0].staffId || staffSchedules[0].id;
            const staffDetail = staffDetailsMap.get(firstStaffId);
            if (staffDetail?.department) {
              // Find department ID from department name
              const dept = departments.find(d => 
                d.name.toLowerCase() === staffDetail.department.toLowerCase() ||
                d._id === staffDetail.department
              );
              if (dept) {
                departmentIdToUse = dept._id;
              }
            }
          }
        }
        
        // If still no department, we need to alert the user
        if (!departmentIdToUse) {
          alert('Please select a department before exporting PDF. Department information is required for all schedules.');
          setLoading(false);
          return;
        }
        
        // Check if we need to get department IDs from staff data
        const schedulesToSave = staffSchedules.map(staff => {
          const scheduleData = {
            staffId: staff.staffId || staff.id,
            weekStartDate: getWeekStart(currentWeek).toISOString(),
            schedule: staff.schedule,
            departmentId: staff.departmentId || departmentIdToUse // Use staff's department or the common one
          };
          
          return scheduleData;
        });

        console.log('Schedules to save:', schedulesToSave);

        const saveResponse = await fetch(`${API_BASE_URL}/shift-schedules/bulk`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ schedules: schedulesToSave })
        });

        console.log('Save response status:', saveResponse.status);

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Save failed:', errorData);
          alert(`Failed to save schedules before export: ${errorData.message || 'Unknown error'}. Please save your changes manually and try again.`);
          setLoading(false);
          return;
        }
        
        const saveData = await saveResponse.json();
        console.log('Schedules saved successfully:', saveData);
        console.log('Now exporting PDF...');
        
        // Wait a bit for database to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const weekStart = getWeekStart(currentWeek);
      const params = new URLSearchParams({
        weekStartDate: weekStart.toISOString().split('T')[0]
      });
      
      if (selectedDepartment) {
        params.append('departmentId', selectedDepartment);
      }

      console.log('Exporting PDF with params:', {
        weekStartDate: weekStart.toISOString().split('T')[0],
        departmentId: selectedDepartment,
        token: localStorage.getItem('token') ? 'Present' : 'Missing'
      });

      // Make authenticated request to get PDF
      const response = await fetch(`${API_BASE_URL}/shift-schedules/export/pdf?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('PDF export response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        // Get the PDF blob
        const blob = await response.blob();
        console.log('PDF blob received:', { size: blob.size, type: blob.type });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shift-schedule-${weekStart.toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        alert('PDF exported successfully!');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('PDF export failed:', errorMessage);
        alert(`Failed to export PDF: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`Failed to export PDF. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  */

  const getShiftColor = (shift) => {
    switch (shift) {
      case 'morning': return 'bg-blue-50';
      case 'evening': return 'bg-green-50';
      case 'night': return 'bg-purple-50';
      case 'on-call': return 'bg-yellow-50';
      case 'off-duty': return 'bg-gray-50';
      default: return 'bg-white';
    }
  };

  const getAvatarColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500', 
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin/staff" className="flex items-center text-blue-600 hover:text-blue-800 mr-4">
            <ChevronLeftIcon size={20} />
            <span>Back to Staff Management</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Shift Scheduling</h1>
        </div>
        {/* <div className="flex space-x-2">
          <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50">Day</button>
          <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50 bg-blue-600 text-white">Week</button>
          <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-50">Month</button>
        </div> */}
      </div>

      {/* Unsaved Changes Warning Banner */}
      {hasUnsavedChanges && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <span className="font-medium">You have unsaved changes!</span> Click the <span className="font-semibold">"Save Changes"</span> button to save your schedule to the database before publishing.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button onClick={() => navigateWeek(-1)} className="border border-gray-300 rounded-md p-1 hover:bg-gray-50">
              <ChevronLeftIcon size={20} />
            </button>
            <h2 className="text-lg font-semibold">{formatWeekRange(currentWeek)}</h2>
            <button onClick={() => navigateWeek(1)} className="border border-gray-300 rounded-md p-1 hover:bg-gray-50">
              <ChevronRightIcon size={20} />
            </button>
            {isPublished && (
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Published
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 bg-white text-gray-700 pl-10 pr-8 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
              <FilterIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <button onClick={() => window.location.reload()} className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
              <RefreshCwIcon size={18} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <button 
              onClick={handleSaveChanges} 
              disabled={loading} 
              className={`border border-gray-300 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                hasUnsavedChanges 
                  ? 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {hasUnsavedChanges ? 'Save Changes *' : 'Save Changes'}
            </button>
            <button 
              onClick={handleAddStaffClick} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <PlusIcon size={18} className="mr-2" />
              Add Staff
            </button>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleDownloadPDF} 
              disabled={staffSchedules.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} className="mr-2" />
              Download PDF
            </button>
            <button 
              onClick={handlePublishRoster} 
              disabled={loading || staffSchedules.length === 0} 
              className={`px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                isPublished 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPublished ? '✓ Published (Republish)' : 'Publish Roster'}
            </button>
          </div>
        </div>

        {isPublished && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>This roster has been published.</strong> Schedule editing is locked and staff have been notified. Use "Export PDF" to download the final schedule.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading schedules...</span>
            </div>
          ) : (
            <>
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200 bg-gray-50 w-32">
                      STAFF / DAY
                    </th>
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day, index) => (
                      <th key={day} className="py-2 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200 bg-gray-50">
                        <div>{day}</div>
                        <div className="text-xs normal-case font-normal">
                          {getWeekDates(currentWeek)[index]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </th>
                    ))}
                    {!isPublished && (
                      <th className="py-2 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200 bg-gray-50 w-16">
                        ACTIONS
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {staffSchedules.map((staff) => (
                    <tr key={staff.id}>
                      <td className="py-2 px-4 border border-gray-200 bg-gray-50">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getAvatarColor(staff.avatar)} flex items-center justify-center text-white mr-2`}>
                            <span className="font-medium">{staff.initials}</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{staff.staffName}</div>
                            <div className="text-xs text-gray-500">{staff.role}</div>
                          </div>
                        </div>
                      </td>
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <td key={day} className="py-2 px-2 border border-gray-200">
                          <select 
                            value={staff.schedule[day]}
                            onChange={(e) => handleScheduleChange(staff.id, day, e.target.value)}
                            disabled={isPublished}
                            className={`w-full border border-gray-300 rounded-md text-sm p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getShiftColor(staff.schedule[day])} disabled:cursor-not-allowed`}
                          >
                            <option value="morning">Morning</option>
                            <option value="evening">Evening</option>
                            <option value="night">Night</option>
                            <option value="on-call">On Call</option>
                            <option value="off-duty">Off Duty</option>
                          </select>
                        </td>
                      ))}
                      {!isPublished && (
                        <td className="py-2 px-2 border border-gray-200 text-center">
                          <button
                            onClick={() => handleRemoveStaff(staff.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove staff from schedule"
                          >
                            <XIcon size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex mt-4 gap-2 flex-wrap">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 rounded-sm mr-1 border border-gray-300"></div>
                  <span className="text-xs">Morning</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded-sm mr-1 border border-gray-300"></div>
                  <span className="text-xs">Evening</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-100 rounded-sm mr-1 border border-gray-300"></div>
                  <span className="text-xs">Night</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 rounded-sm mr-1 border border-gray-300"></div>
                  <span className="text-xs">On Call</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-100 rounded-sm mr-1 border border-gray-300"></div>
                  <span className="text-xs">Off Duty</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Staff Availability</h3>
          <div className="space-y-4">
            {availabilityData.map((dept, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{dept.department} Department</span>
                  <span className="text-xs text-gray-500">{dept.availableStaff}/{dept.totalStaff} available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      dept.availabilityPercentage >= 70 ? 'bg-green-500' :
                      dept.availabilityPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.availabilityPercentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Upcoming Leave Requests</h3>
          <div className="space-y-3">
            <div className="border rounded-lg p-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Dr. Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Cardiology  June 20-23, 2023</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-md hover:bg-green-200">Approve</button>
                  <button className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-md hover:bg-red-200">Deny</button>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm">View All Leave Requests</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Staff to Schedule</h3>
              <button 
                onClick={() => setShowStaffModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Select staff members to add to the schedule:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableStaff.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No available staff found for the selected department
                  </p>
                ) : (
                  availableStaff.map((staff) => (
                    <div key={staff._id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        id={`staff-${staff._id}`}
                        checked={selectedStaffToAdd.some(s => s._id === staff._id)}
                        onChange={(e) => handleStaffSelection(staff, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`staff-${staff._id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <span className="font-medium">
                              {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {staff.firstName} {staff.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {staff.position} • {staff.department}
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStaffModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelectedStaff}
                disabled={selectedStaffToAdd.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add {selectedStaffToAdd.length} Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftScheduling;