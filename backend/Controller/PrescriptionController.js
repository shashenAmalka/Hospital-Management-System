const Prescription = require('../Model/PrescriptionModel');
const User = require('../Model/UserModel');
const Staff = require('../Model/StaffModel');
const Notification = require('../Model/NotificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all prescriptions
exports.getAllPrescriptions = catchAsync(async (req, res, next) => {
  const prescriptions = await Prescription.find().sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: prescriptions.length,
    data: prescriptions
  });
});

// Get prescription by ID
exports.getPrescriptionById = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: prescription
  });
});

// Get prescriptions by patient ID
exports.getPrescriptionsByPatient = catchAsync(async (req, res, next) => {
  const { patientId } = req.params;
  
  const prescriptions = await Prescription.find({ patient: patientId })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: prescriptions.length,
    data: prescriptions
  });
});

// Get prescriptions by doctor ID
exports.getPrescriptionsByDoctor = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;
  
  const prescriptions = await Prescription.find({ doctor: doctorId })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: prescriptions.length,
    data: prescriptions
  });
});

// Get prescriptions for pharmacy (pending and sent-to-pharmacy status)
exports.getPrescriptionsForPharmacy = catchAsync(async (req, res, next) => {
  const prescriptions = await Prescription.find({
    status: { $in: ['sent-to-pharmacy', 'in-progress'] }
  }).sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: prescriptions.length,
    data: prescriptions
  });
});

// Create new prescription
exports.createPrescription = catchAsync(async (req, res, next) => {
  const prescriptionData = req.body;
  
  // Validate patient exists
  const patient = await User.findById(prescriptionData.patient);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }
  
  // Validate doctor exists
  const doctor = await Staff.findById(prescriptionData.doctor);
  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }
  
  const prescription = await Prescription.create(prescriptionData);
  
  res.status(201).json({
    status: 'success',
    data: prescription
  });
});

// Update prescription
exports.updatePrescription = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: prescription
  });
});

// Send prescription to pharmacy
exports.sendToPharmacy = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    { status: 'sent-to-pharmacy' },
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }
  
  // Find all pharmacists to send notifications
  try {
    const pharmacists = await Staff.find({ role: 'pharmacist' });
    
    // Create notifications for all pharmacists
    const notificationPromises = pharmacists.map(pharmacist => 
      Notification.create({
        user: pharmacist._id,
        title: 'New Prescription Available',
        message: `A new prescription has been sent by Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName} for patient ${prescription.patient.firstName} ${prescription.patient.lastName}.`,
        type: 'info',
        relatedTo: {
          model: 'Prescription',
          id: prescription._id
        }
      })
    );
    
    await Promise.all(notificationPromises);
    console.log(`Notifications created for ${pharmacists.length} pharmacists`);
  } catch (notificationError) {
    console.error('Error creating notifications:', notificationError);
    // Don't fail the prescription update if notification fails
  }
  
  res.status(200).json({
    status: 'success',
    data: prescription
  });
});

// Update prescription status
exports.updatePrescriptionStatus = catchAsync(async (req, res, next) => {
  const { status, dispensedBy } = req.body;
  
  const updateData = { status };
  
  // If status is dispensed, add dispensed info
  if (status === 'dispensed' || status === 'completed') {
    updateData.dispensedBy = dispensedBy;
    updateData.dispensedAt = new Date();
  }
  
  const prescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: prescription
  });
});

// Delete prescription
exports.deletePrescription = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }
  
  await Prescription.findByIdAndDelete(req.params.id);
  
  res.status(204).send();
});
