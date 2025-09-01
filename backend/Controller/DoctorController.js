const Doctor = require('../models/DoctorModel');
const User = require('../models/UserModel');

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate('user', 'name email mobileNumber')
      .select('-__v');
    
    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email mobileNumber');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.status(200).json({ doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor schedule
const updateDoctorSchedule = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { schedule: req.body.schedule },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({ doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  updateDoctorSchedule
};