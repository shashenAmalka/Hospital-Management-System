const LabReport = require('../Model/LabReportModel');
const LabRequest = require('../Model/LabRequestModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new lab report
exports.createLabReport = catchAsync(async (req, res) => {
  // Add the user ID from the token as the createdBy field
  req.body.createdBy = req.user.id || req.user._id;
  
  const newReport = await LabReport.create(req.body);
  
  // After successfully creating the lab report, update the corresponding lab request status
  if (req.body.labRequestId) {
    try {
      const labRequest = await LabRequest.findById(req.body.labRequestId);
      
      if (labRequest) {
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
      }
    } catch (labRequestError) {
      // Log the error but don't fail the lab report creation
      console.error('Error updating lab request status:', labRequestError);
      // Lab report was still created successfully, so we continue
    }
  }
  
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