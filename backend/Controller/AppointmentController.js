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

// Get doctor's patients (unique patients from confirmed/completed appointments)
exports.getDoctorPatients = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;
  
  // Get all confirmed or completed appointments for this doctor
  const appointments = await Appointment.find({ 
    doctor: doctorId,
    status: { $in: ['confirmed', 'completed'] }
  }).distinct('patient');
  
  // Get patient details
  const patients = await User.find({ _id: { $in: appointments } })
    .select('firstName lastName email phone');
  
  // Get the last appointment for each patient
  const patientsWithLastAppointment = await Promise.all(
    patients.map(async (patient) => {
      const lastAppointment = await Appointment.findOne({
        patient: patient._id,
        doctor: doctorId,
        status: { $in: ['confirmed', 'completed'] }
      })
      .sort({ appointmentDate: -1 })
      .select('appointmentDate appointmentTime status diagnosis');
      
      return {
        ...patient.toObject(),
        lastAppointment
      };
    })
  );
  
  res.status(200).json({
    status: 'success',
    results: patientsWithLastAppointment.length,
    data: patientsWithLastAppointment
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
  
  // If appointment is confirmed, create a notification for the patient
  if (status === 'confirmed') {
    try {
      await Notification.create({
        user: appointment.patient._id,
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime} has been confirmed.`,
        type: 'info',
        relatedTo: {
          model: 'Appointment',
          id: appointment._id
        }
      });
      console.log('Confirmation notification sent to patient');
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }
  }
  
  res.status(200).json({
    status: 'success',
    data: appointment
  });
});

// Get activity statistics for the last N days (for dashboard chart)
exports.getActivityStatistics = catchAsync(async (req, res, next) => {
  const days = parseInt(req.query.days) || 7; // Default to 7 days
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  // Get appointments grouped by date
  const appointments = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  // Get unique patients per day
  const patients = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
          patient: "$patient"
        }
      }
    },
    {
      $group: {
        _id: "$_id.date",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  // Get lab requests (if LabRequest model exists)
  let labRequests = [];
  try {
    const LabRequest = require('../Model/LabRequestModel');
    labRequests = await LabRequest.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
  } catch (error) {
    console.log('Lab requests not available:', error.message);
  }
  
  // Create a map for easy lookup
  const appointmentsMap = {};
  appointments.forEach(item => {
    appointmentsMap[item._id] = item.count;
  });
  
  const patientsMap = {};
  patients.forEach(item => {
    patientsMap[item._id] = item.count;
  });
  
  const labRequestsMap = {};
  labRequests.forEach(item => {
    labRequestsMap[item._id] = item.count;
  });
  
  // Generate data for each day
  const activityData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    const dayName = dayNames[date.getDay()];
    
    activityData.push({
      date: dateString,
      day: dayName,
      appointments: appointmentsMap[dateString] || 0,
      patients: patientsMap[dateString] || 0,
      labTests: labRequestsMap[dateString] || 0
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: activityData
  });
});