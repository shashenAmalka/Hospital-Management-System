const Leave = require('../Model/LeaveModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/leave-documents/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/leave-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed!'));
    }
  }
});

// Create a new leave request
const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const doctorId = req.user?.id;
    const doctorName = req.user?.name;

    if (!doctorId || !doctorName) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Handle supporting documents
    let supportingDocuments = [];
    if (req.files && req.files.length > 0) {
      supportingDocuments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path
      }));
    }

    const leaveRequest = new Leave({
      doctorId,
      doctorName,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      supportingDocuments
    });

    await leaveRequest.save();

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ 
      message: 'Error creating leave request', 
      error: error.message 
    });
  }
};

// Get all leave requests for the authenticated doctor
const getDoctorLeaveRequests = async (req, res) => {
  try {
    const doctorId = req.user?.id;

    if (!doctorId) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const leaveRequests = await Leave.find({ doctorId })
      .sort({ submittedAt: -1 })
      .populate('approvedBy', 'name');

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      message: 'Error fetching leave requests', 
      error: error.message 
    });
  }
};

// Get a specific leave request by ID
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user?.id;

    const leaveRequest = await Leave.findOne({ _id: id, doctorId })
      .populate('approvedBy', 'name');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.status(200).json(leaveRequest);
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({ 
      message: 'Error fetching leave request', 
      error: error.message 
    });
  }
};

// Update a leave request (only if status is Pending)
const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { leaveType, startDate, endDate, reason } = req.body;
    const doctorId = req.user?.id;

    const leaveRequest = await Leave.findOne({ _id: id, doctorId });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ 
        message: 'Cannot update leave request. Only pending requests can be modified.' 
      });
    }

    // Handle new supporting documents
    let newSupportingDocuments = [];
    if (req.files && req.files.length > 0) {
      newSupportingDocuments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path
      }));
    }

    // Update the leave request
    const updatedData = {
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason
    };

    // If new documents are uploaded, replace the old ones
    if (newSupportingDocuments.length > 0) {
      updatedData.supportingDocuments = [
        ...leaveRequest.supportingDocuments,
        ...newSupportingDocuments
      ];
    }

    const updatedLeaveRequest = await Leave.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Leave request updated successfully',
      leaveRequest: updatedLeaveRequest
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ 
      message: 'Error updating leave request', 
      error: error.message 
    });
  }
};

// Delete a leave request (only if status is Pending)
const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user?.id;

    const leaveRequest = await Leave.findOne({ _id: id, doctorId });

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ 
        message: 'Cannot delete leave request. Only pending requests can be deleted.' 
      });
    }

    await Leave.findByIdAndDelete(id);

    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ 
      message: 'Error deleting leave request', 
      error: error.message 
    });
  }
};

// Admin functions - Get all leave requests
const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const leaveRequests = await Leave.find(filter)
      .sort({ submittedAt: -1 })
      .populate('doctorId', 'name email')
      .populate('approvedBy', 'name');

    res.status(200).json(leaveRequests);
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    res.status(500).json({ 
      message: 'Error fetching leave requests', 
      error: error.message 
    });
  }
};

// Admin function - Approve or reject leave request
const reviewLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvalComments } = req.body;
    const reviewerId = req.user?.id;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Approved or Rejected.' });
    }

    const leaveRequest = await Leave.findById(id);

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ 
        message: 'Leave request has already been reviewed' 
      });
    }

    const updatedLeaveRequest = await Leave.findByIdAndUpdate(
      id,
      {
        status,
        approvedBy: reviewerId,
        approvalComments,
        reviewedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('doctorId', 'name email').populate('approvedBy', 'name');

    res.status(200).json({
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest: updatedLeaveRequest
    });
  } catch (error) {
    console.error('Error reviewing leave request:', error);
    res.status(500).json({ 
      message: 'Error reviewing leave request', 
      error: error.message 
    });
  }
};

module.exports = {
  createLeaveRequest,
  getDoctorLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  getAllLeaveRequests,
  reviewLeaveRequest
};