const mongoose = require('mongoose');
const socketServer = require('../utils/socketServer');
const User = require('../Model/UserModel');
const Notification = require('../Model/NotificationModel');

// Ensure LabRequest model is loaded
let LabRequest;
try {
  LabRequest = require('../Model/LabRequestModel');
} catch (error) {
  console.warn('LabRequestModel not found, creating inline model');
  
  const labRequestSchema = new mongoose.Schema({
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    patientName: String,
    testType: String,
    priority: { type: String, default: 'normal' },
    status: { type: String, default: 'pending' },
    notes: String,
    statusHistory: [{
      status: String,
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
      notes: String
    }],
    completedAt: Date
  }, { timestamps: true });
  
  LabRequest = mongoose.models.LabRequest || mongoose.model('LabRequest', labRequestSchema);
}

// Create a new lab request
exports.createLabRequest = async (req, res) => {
  try {
    console.log('Creating lab request with body:', req.body);
    console.log('User from token:', req.user);
    
    const { testType, priority, notes, patientName } = req.body;
    
    // Validate basic input
    if (!testType) {
      return res.status(400).json({ message: 'Test type is required' });
    }
    
    // Get user ID from authenticated user
    const patientId = req.user.id || req.user._id;
    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID not found in token' });
    }
    
    // Use provided name or construct from user data
    const displayName = patientName || 
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() ||
      req.user.username ||
      'Unknown Patient';
    
    // Create new lab request document
    const labRequest = new LabRequest({
      patientId,
      patientName: displayName,
      testType,
      priority: priority || 'normal',
      notes,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        changedBy: patientId,
        timestamp: new Date(),
        notes: 'Initial request'
      }]
    });
    
    console.log('Saving lab request:', labRequest);
    
    // Save to MongoDB
    const savedRequest = await labRequest.save();
    console.log('✅ Lab request saved successfully:', savedRequest._id);
    
    // Find lab technicians to notify
    try {
      const labTechs = await User.find({ role: 'lab_technician' });
      
      // Create notifications for each lab technician
      for (const tech of labTechs) {
        const notification = new Notification({
          user: tech._id,
          title: 'New Lab Request',
          message: `New ${testType} test requested for ${displayName}`,
          type: 'info',
          read: false,
          relatedTo: {
            model: 'Test',
            id: savedRequest._id
          }
        });
        
        await notification.save();
        
        // Send real-time notification via socket.io
        socketServer.sendNotificationToUser(tech._id.toString(), notification);
      }
      
      // Also broadcast to all lab technicians
      socketServer.sendLabRequestNotification({
        _id: savedRequest._id,
        title: 'New Lab Request',
        message: `New ${testType} test requested for ${displayName}`,
        priority: priority || 'normal',
        createdAt: new Date(),
        relatedTo: {
          model: 'Test',
          id: savedRequest._id
        }
      });
      
      console.log('✅ Lab request notifications sent to lab technicians');
    } catch (notifyError) {
      console.error('Error sending notifications:', notifyError);
      // Continue with the response even if notifications fail
    }
    
    return res.status(201).json({
      success: true,
      message: 'Lab request created successfully',
      data: savedRequest
    });
  } catch (error) {
    console.error('❌ Error creating lab request:', error);
    return res.status(500).json({ 
      message: 'Server error creating lab request', 
      error: error.message 
    });
  }
};

// Get all lab requests for a patient
exports.getPatientLabRequests = async (req, res) => {
  try {
    const patientId = req.user.id || req.user._id;
    console.log('Fetching lab requests for patient:', patientId);
    
    // Fetch requests from database
    const labRequests = await LabRequest.find({ patientId })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${labRequests.length} lab requests for patient`);
    
    // Add canEdit flag based on 1-hour rule
    const labRequestsWithEditFlag = labRequests.map(request => {
      const oneHour = 60 * 60 * 1000;
      const canEdit = (
        request.status === 'pending' && 
        (Date.now() - new Date(request.createdAt).getTime() <= oneHour)
      );
      
      return {
        ...request.toObject(),
        canEdit
      };
    });
    
    return res.status(200).json({
      success: true,
      count: labRequests.length,
      data: labRequestsWithEditFlag
    });
  } catch (error) {
    console.error('Error fetching lab requests:', error);
    return res.status(500).json({ 
      message: 'Server error fetching lab requests',
      error: error.message 
    });
  }
};

// Get all lab requests (for lab technicians)
exports.getAllLabRequests = async (req, res) => {
  try {
    console.log('Fetching all lab requests for lab technician');
    
    // Query filters
    const { status, priority, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { testType: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Fetch requests from database with sorting by priority and creation date
    const labRequests = await LabRequest.find(query)
      .sort({ 
        priority: 1, // emergency first, then urgent, then normal
        createdAt: -1 // newest to oldest
      });
    
    console.log(`Found ${labRequests.length} total lab requests`);
    
    return res.status(200).json({
      success: true,
      count: labRequests.length,
      data: labRequests
    });
  } catch (error) {
    console.error('Error fetching all lab requests:', error);
    return res.status(500).json({ 
      message: 'Server error fetching lab requests',
      error: error.message 
    });
  }
};

// Update a lab request
exports.updateLabRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { testType, priority, notes } = req.body;
    const userId = req.user._id || req.user.id;
    
    // Find request in database
    const labRequest = await LabRequest.findById(id);
    if (!labRequest) {
      return res.status(404).json({ message: 'Lab request not found' });
    }
    
    // Verify ownership - Adding defensive coding to prevent toString() errors on undefined
    if (!userId || !labRequest.patientId || 
        userId.toString() !== labRequest.patientId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }
    
    // Check one-hour time limit
    const oneHour = 60 * 60 * 1000; // 60 minutes
    if (Date.now() - new Date(labRequest.createdAt).getTime() > oneHour) {
      return res.status(400).json({ message: 'Cannot edit request after 1 hour of creation' });
    }
    
    // Check if already processed
    if (labRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit request once it has been processed' });
    }
    
    // Update fields
    labRequest.testType = testType || labRequest.testType;
    labRequest.priority = priority || labRequest.priority;
    labRequest.notes = notes || labRequest.notes;
    
    // Add history entry
    labRequest.statusHistory.push({
      status: labRequest.status,
      changedBy: userId,
      timestamp: new Date(),
      notes: 'Request updated by patient'
    });
    
    // Save changes
    await labRequest.save();
    
    return res.status(200).json({
      success: true,
      message: 'Lab request updated successfully',
      data: labRequest
    });
  } catch (error) {
    console.error('Error updating lab request:', error);
    return res.status(500).json({ 
      message: 'Server error updating lab request',
      error: error.message 
    });
  }
};

// Delete a lab request
exports.deleteLabRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    
    if (!id) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    
    // Find request in database
    const labRequest = await LabRequest.findById(id);
    if (!labRequest) {
      return res.status(404).json({ message: 'Lab request not found' });
    }
    
    // Check user role
    const userRole = req.user.role;
    const isLabTechnician = userRole === 'lab_technician' || userRole === 'admin';
    
    // Only enforce restrictions for patients
    if (!isLabTechnician) {
      // Verify ownership with proper null checks for patients
      if (!labRequest.patientId || userId.toString() !== labRequest.patientId.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this request' });
      }
      
      // Check one-hour time limit for patients
      const oneHour = 60 * 60 * 1000; // 60 minutes
      if (Date.now() - new Date(labRequest.createdAt).getTime() > oneHour) {
        return res.status(400).json({ message: 'Cannot delete request after 1 hour of creation' });
      }
      
      // Check if already processed for patients
      if (labRequest.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot delete request once it has been processed' });
      }
    }
    
    // Log deletion for audit purposes
    console.log(`Lab request ${id} being deleted by user ${userId} with role ${userRole}`);
    
    // If lab technician or admin is deleting, also delete any associated lab reports
    if (isLabTechnician) {
      try {
        const LabReport = require('../Model/LabReportModel');
        // Find and delete any associated lab reports
        const deleted = await LabReport.deleteMany({ labRequestId: id });
        console.log(`Deleted ${deleted.deletedCount} lab reports associated with request ${id}`);
      } catch (error) {
        console.error('Error deleting associated lab reports:', error);
        // Continue with deleting the request even if report deletion fails
      }
    }
    
    // Delete from database - Use LabRequest model directly
    await LabRequest.findByIdAndDelete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Lab request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lab request:', error);
    return res.status(500).json({ 
      message: 'Server error deleting lab request',
      error: error.message 
    });
  }
};

// Update lab request status (for lab technicians)
exports.updateLabRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find request in database
    const labRequest = await LabRequest.findById(id);
    if (!labRequest) {
      return res.status(404).json({ message: 'Lab request not found' });
    }
    
    // Verify role (already checked in middleware, but double-check)
    if (req.user.role !== 'lab_technician' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update request status' });
    }
    
    // Update status
    labRequest.status = status;
    
    // Set completedAt if completed
    if (status === 'completed' && !labRequest.completedAt) {
      labRequest.completedAt = new Date();
    }
    
    // Add history entry
    labRequest.statusHistory.push({
      status,
      changedBy: userId,
      timestamp: new Date(),
      notes: notes || `Status updated to ${status}`
    });
    
    // Save changes
    await labRequest.save();
    
    return res.status(200).json({
      success: true,
      message: 'Lab request status updated successfully',
      data: labRequest
    });
  } catch (error) {
    console.error('Error updating lab request status:', error);
    return res.status(500).json({ 
      message: 'Server error updating lab request status',
      error: error.message 
    });
  }
};

// Add new controller methods for notes management
exports.updateNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const { notes } = req.body;
    const userId = req.user._id;

    const labRequest = await LabRequest.findById(id);
    if (!labRequest) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    // Find the note to update
    const historyEntry = labRequest.statusHistory.id(noteId);
    if (!historyEntry) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Update the note directly
    historyEntry.notes = notes;
    await labRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: labRequest
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({ message: 'Error updating note' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const userId = req.user._id;

    const labRequest = await LabRequest.findById(id);
    if (!labRequest) {
      return res.status(404).json({ message: 'Lab request not found' });
    }

    // Use the schema method to delete the note
    await labRequest.deleteStatusNote(noteId);

    // Add history entry for note deletion
    labRequest.statusHistory.push({
      status: labRequest.status,
      changedBy: userId,
      timestamp: new Date(),
      notes: 'Note deleted by user'
    });

    await labRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: labRequest
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ message: 'Error deleting note' });
  }
};
