const mongoose = require('mongoose');

// Make sure we have access to the LabRequest model
let LabRequest;
try {
  LabRequest = require('../Model/LabRequestModel');
} catch (error) {
  console.warn('LabRequestModel not found in separate file, using mongoose model');
  LabRequest = mongoose.models.LabRequest;
}

// Get a single lab request by ID
exports.getLabRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid lab request ID provided'
      });
    }
    
    // Find the lab request by ID
    const labRequest = await LabRequest.findById(id)
      .populate('patientId', 'firstName lastName username')
      .populate('statusHistory.changedBy', 'firstName lastName username');
    
    // Check if it exists
    if (!labRequest) {
      return res.status(404).json({
        success: false,
        message: 'Lab request not found'
      });
    }
    
    // Return the lab request data
    return res.status(200).json({
      success: true,
      data: labRequest
    });
  } catch (error) {
    console.error('Error fetching lab request by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching lab request: ' + error.message
    });
  }
};