const LabTest = require('../models/LabTestModel');

// Get all lab tests
const getAllLabTests = async (req, res) => {
  try {
    let filter = {};
    
    // Lab technicians can only see tests assigned to them or all if admin
    if (req.user.role === 'lab_technician') {
      filter.requestedBy = req.user.id;
    }
    
    // Patients can only see their own tests
    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    }
    
    const labTests = await LabTest.find(filter)
      .populate('patient', 'name email')
      .populate('requestedBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ labTests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create lab test (Doctors and Admin only)
const createLabTest = async (req, res) => {
  try {
    const labTest = new LabTest({
      ...req.body,
      requestedBy: req.user.id
    });
    await labTest.save();
    
    await labTest.populate('patient', 'name email');
    await labTest.populate('requestedBy', 'name role');
    
    res.status(201).json({ labTest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update lab test results (Lab technicians and Admin)
const updateLabTestResults = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      {
        results: req.body.results,
        findings: req.body.findings,
        status: 'Completed',
        resultDate: new Date()
      },
      { new: true, runValidators: true }
    ).populate('patient', 'name email')
     .populate('requestedBy', 'name role');
    
    res.status(200).json({ labTest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllLabTests,
  createLabTest,
  updateLabTestResults
};