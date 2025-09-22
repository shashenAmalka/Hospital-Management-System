const Appointment = require('../Model/AppointmentModel');
const User = require('../Model/UserModel');
const Staff = require('../Model/StaffModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all appointments
exports.getAllAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find().sort({ appointmentDate: 1 });
  
  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: appointments
  });
});

// Get appointment by ID
exports.getAppointmentById = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: appointment
  });
});

// Get appointments by user ID
exports.getAppointmentsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const appointments = await Appointment.find({ patient: userId })
    .sort({ appointmentDate: -1 });
  
  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: appointments
  });
});

// Get appointments by doctor ID
exports.getAppointmentsByDoctor = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;
  
  const appointments = await Appointment.find({ doctor: doctorId })
    .sort({ appointmentDate: 1 });
  
  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: appointments
  });
});

// Create new appointment
exports.createAppointment = catchAsync(async (req, res, next) => {
  const appointmentData = req.body;
  
  // Validate patient exists
  const patient = await User.findById(appointmentData.patient);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }
  
  // Validate doctor exists
  const doctor = await Staff.findById(appointmentData.doctor);
  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }
  
  // Check for conflicting appointments
  const conflictingAppointment = await Appointment.findOne({
    doctor: appointmentData.doctor,
    appointmentDate: appointmentData.appointmentDate,
    appointmentTime: appointmentData.appointmentTime,
    status: { $nin: ['cancelled', 'completed'] }
  });
  
  if (conflictingAppointment) {
    return next(new AppError('Doctor is not available at this time', 400));
  }
  
  const appointment = await Appointment.create(appointmentData);
  
  res.status(201).json({
    status: 'success',
    data: appointment
  });
});

// Update appointment
exports.updateAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: appointment
  });
});

// Delete appointment
exports.deleteAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get appointments for today
exports.getTodayAppointments = catchAsync(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const appointments = await Appointment.find({
    appointmentDate: {
      $gte: today,
      $lt: tomorrow
    }
  }).sort({ appointmentTime: 1 });
  
  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: appointments
  });
});

// Get upcoming appointments
exports.getUpcomingAppointments = catchAsync(async (req, res, next) => {
  const now = new Date();
  
  const appointments = await Appointment.find({
    appointmentDate: { $gte: now },
    status: { $nin: ['cancelled', 'completed'] }
  }).sort({ appointmentDate: 1, appointmentTime: 1 });
  
  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: appointments
  });
});

// Update appointment status
exports.updateAppointmentStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: appointment
  });
});