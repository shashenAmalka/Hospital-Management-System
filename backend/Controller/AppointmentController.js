const Appointment = require('../models/AppointmentModel');

// Get all appointments with filters
const getAllAppointments = async (req, res) => {
  try {
    const { status, date, doctor } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (date) filter.date = new Date(date);
    if (doctor) filter.doctor = doctor;
    
    // Doctors can only see their own appointments
    if (req.user.role === 'doctor') {
      filter.doctor = req.user.id;
    }
    
    // Patients can only see their own appointments
    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    }
    
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email')
      .populate('doctor', 'user specialization')
      .sort({ date: 1, time: 1 });
    
    res.status(200).json({ appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    
    await appointment.populate('patient', 'name email');
    await appointment.populate('doctor', 'user specialization');
    
    res.status(201).json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('patient', 'name email')
     .populate('doctor', 'user specialization');
    
    res.status(200).json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus
};