const Appointment = require('../Model/AppointmentModel');
const User = require('../Model/UserModel');
const Staff = require('../Model/StaffModel');
const Notification = require('../Model/NotificationModel');
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
  
  // Create notification for the doctor
  try {
    await Notification.create({
      user: appointmentData.doctor,
      title: 'New Appointment Scheduled',
      message: `You have a new appointment scheduled with ${patient.firstName} ${patient.lastName} on ${new Date(appointmentData.appointmentDate).toLocaleDateString()} at ${appointmentData.appointmentTime}.`,
      type: 'info',
      relatedTo: {
        model: 'Appointment',
        id: appointment._id
      }
    });
    console.log('Notification created for doctor:', appointmentData.doctor);
  } catch (notificationError) {
    console.error('Error creating notification:', notificationError);
    // Don't fail the appointment creation if notification fails
  }
  
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
  console.log(`Attempting to delete appointment with ID: ${req.params.id}`);
  
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    console.log(`Appointment with ID ${req.params.id} not found`);
    return next(new AppError('Appointment not found', 404));
  }
  
  // Delete the appointment
  await Appointment.findByIdAndDelete(req.params.id);
  console.log(`Successfully deleted appointment with ID: ${req.params.id}`);
  
  // For 204 responses, don't send a JSON body as it won't be processed
  res.status(204).send();
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

// Search appointments
exports.searchAppointments = catchAsync(async (req, res, next) => {
  const { query, searchType = 'all' } = req.query;
  
  if (!query || query.trim() === '') {
    return next(new AppError('Search query is required', 400));
  }
  
  const searchQuery = query.trim();
  let matchConditions = [];
  
  // Create search conditions based on searchType
  if (searchType === 'all' || searchType === 'type') {
    // Search by appointment type
    matchConditions.push({
      type: { $regex: searchQuery, $options: 'i' }
    });
  }
  
  if (searchType === 'all' || searchType === 'reason') {
    // Search by reason/notes
    matchConditions.push(
      { reason: { $regex: searchQuery, $options: 'i' } },
      { notes: { $regex: searchQuery, $options: 'i' } }
    );
  }
  
  // For doctor name and department search, we need to use aggregation pipeline
  // to search in populated fields
  let pipeline = [];
  
  // First stage: lookup doctor information
  pipeline.push({
    $lookup: {
      from: 'staff',
      localField: 'doctor',
      foreignField: '_id',
      as: 'doctorInfo'
    }
  });
  
  // Second stage: lookup department information
  pipeline.push({
    $lookup: {
      from: 'departments',
      localField: 'department',
      foreignField: '_id',
      as: 'departmentInfo'
    }
  });
  
  // Third stage: lookup patient information
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'patient',
      foreignField: '_id',
      as: 'patientInfo'
    }
  });
  
  // Fourth stage: create match conditions
  let aggregateMatchConditions = [];
  
  if (searchType === 'all' || searchType === 'type') {
    aggregateMatchConditions.push({
      type: { $regex: searchQuery, $options: 'i' }
    });
  }
  
  if (searchType === 'all' || searchType === 'reason') {
    aggregateMatchConditions.push(
      { reason: { $regex: searchQuery, $options: 'i' } },
      { notes: { $regex: searchQuery, $options: 'i' } }
    );
  }
  
  if (searchType === 'all' || searchType === 'doctor') {
    aggregateMatchConditions.push(
      { 'doctorInfo.firstName': { $regex: searchQuery, $options: 'i' } },
      { 'doctorInfo.lastName': { $regex: searchQuery, $options: 'i' } },
      { 'doctorInfo.specialization': { $regex: searchQuery, $options: 'i' } }
    );
  }
  
  if (searchType === 'all' || searchType === 'department') {
    aggregateMatchConditions.push(
      { 'departmentInfo.name': { $regex: searchQuery, $options: 'i' } },
      { 'departmentInfo.description': { $regex: searchQuery, $options: 'i' } }
    );
  }
  
  // Add match stage with OR conditions
  pipeline.push({
    $match: {
      $or: aggregateMatchConditions
    }
  });
  
  // Fifth stage: project the fields we want to return
  pipeline.push({
    $project: {
      _id: 1,
      patient: { $arrayElemAt: ['$patientInfo', 0] },
      doctor: { $arrayElemAt: ['$doctorInfo', 0] },
      department: { $arrayElemAt: ['$departmentInfo', 0] },
      appointmentDate: 1,
      appointmentTime: 1,
      type: 1,
      status: 1,
      reason: 1,
      notes: 1,
      symptoms: 1,
      diagnosis: 1,
      treatment: 1,
      prescriptions: 1,
      followUpRequired: 1,
      followUpDate: 1,
      createdAt: 1,
      updatedAt: 1
    }
  });
  
  // Sixth stage: sort by appointment date
  pipeline.push({
    $sort: { appointmentDate: 1, appointmentTime: 1 }
  });
  
  const appointments = await Appointment.aggregate(pipeline);
  
  res.status(200).json({
    status: 'success',
    results: appointments.length,
    searchQuery: searchQuery,
    searchType: searchType,
    data: appointments
  });
});