const Patient = require('../Model/PatientModel');

const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }
        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addPatient = async (req, res) => {
    const { firstName, lastName, dob, gender, address, city, state, zip, phone } = req.body;
    const newPatient = new Patient({ 
        firstName, 
        lastName, 
        dob, 
        gender, 
        address, 
        city, 
        state, 
        zip, 
        phoneNumber: phone // Fixed property name
    });

    try {
        await newPatient.save();
        res.status(201).json(newPatient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedPatient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deletePatient = async (req, res) => {
    try {
        await Patient.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPatientProfile = async (req, res) => {
    try {
        // First try to get from Patient model
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            return res.status(200).json(patient);
        }

        // If not found in Patient model, try User model (since patients might be stored as users)
        const User = require('../Model/UserModel');
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            return res.status(200).json(user);
        }

        return res.status(404).json({ message: "Patient profile not found" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPatientVisitHistory = async (req, res) => {
    try {
        const patientId = req.params.id;
        
        // Import necessary models
        const Appointment = require('../Model/AppointmentModel');
        const LabRequest = require('../Model/LabRequestModel');
        const LabReport = require('../Model/LabReportModel');
        const Prescription = require('../Model/PrescriptionModel');
        
        // Fetch all appointments for the patient
        const appointments = await Appointment.find({ patient: patientId })
            .populate('doctor', 'firstName lastName specialization')
            .populate('department', 'name')
            .sort({ appointmentDate: -1, appointmentTime: -1 })
            .lean();
        
        // For each appointment, fetch related lab requests, lab reports, and prescriptions
        const enrichedVisits = await Promise.all(
            appointments.map(async (appointment) => {
                // Fetch lab requests related to this patient
                let labRequests = [];
                try {
                    labRequests = await LabRequest.find({
                        patientId: patientId,
                        createdAt: {
                            $gte: new Date(new Date(appointment.appointmentDate).setHours(0, 0, 0, 0)),
                            $lte: new Date(new Date(appointment.appointmentDate).setHours(23, 59, 59, 999))
                        }
                    }).lean();
                } catch (err) {
                    console.error('Error fetching lab requests:', err.message);
                }
                
                // Fetch lab reports for these lab requests
                let labReports = [];
                try {
                    const labRequestIds = labRequests.map(lr => lr._id);
                    if (labRequestIds.length > 0) {
                        labReports = await LabReport.find({
                            labRequestId: { $in: labRequestIds }
                        }).lean();
                    }
                } catch (err) {
                    console.error('Error fetching lab reports:', err.message);
                }
                
                // Fetch prescriptions related to this appointment
                let prescriptions = [];
                try {
                    prescriptions = await Prescription.find({
                        $or: [
                            { appointment: appointment._id },
                            { 
                                patient: patientId,
                                createdAt: {
                                    $gte: new Date(new Date(appointment.appointmentDate).setHours(0, 0, 0, 0)),
                                    $lte: new Date(new Date(appointment.appointmentDate).setHours(23, 59, 59, 999))
                                }
                            }
                        ]
                    })
                    .populate('doctor', 'firstName lastName')
                    .populate('dispensedBy', 'firstName lastName')
                    .lean();
                } catch (err) {
                    console.error('Error fetching prescriptions:', err.message);
                }
                
                // Map lab requests with their reports
                const labRequestsWithReports = labRequests.map(request => {
                    const report = labReports.find(r => 
                        r.labRequestId && r.labRequestId.toString() === request._id.toString()
                    );
                    return {
                        ...request,
                        report: report || null
                    };
                });
                
                return {
                    _id: appointment._id,
                    appointmentDate: appointment.appointmentDate,
                    appointmentTime: appointment.appointmentTime,
                    type: appointment.type || 'consultation',
                    status: appointment.status || 'completed',
                    reason: appointment.reason || 'No reason specified',
                    notes: appointment.notes || '',
                    diagnosis: appointment.diagnosis || '',
                    treatment: appointment.treatment || '',
                    symptoms: appointment.symptoms || '',
                    doctor: appointment.doctor ? {
                        _id: appointment.doctor._id,
                        name: `${appointment.doctor.firstName || ''} ${appointment.doctor.lastName || ''}`.trim() || 'Unknown Doctor',
                        firstName: appointment.doctor.firstName,
                        lastName: appointment.doctor.lastName,
                        specialization: appointment.doctor.specialization || 'General'
                    } : null,
                    department: appointment.department ? {
                        _id: appointment.department._id,
                        name: appointment.department.name || 'General'
                    } : null,
                    labRequests: labRequestsWithReports,
                    prescriptions: prescriptions.map(p => ({
                        _id: p._id,
                        diagnosis: p.diagnosis,
                        medicines: p.medicines || [],
                        status: p.status || 'pending',
                        notes: p.notes || '',
                        dispensedBy: p.dispensedBy ? {
                            name: `${p.dispensedBy.firstName || ''} ${p.dispensedBy.lastName || ''}`.trim()
                        } : null,
                        dispensedAt: p.dispensedAt,
                        createdAt: p.createdAt
                    })),
                    followUpRequired: appointment.followUpRequired || false,
                    followUpDate: appointment.followUpDate || null,
                    createdAt: appointment.createdAt,
                    updatedAt: appointment.updatedAt
                };
            })
        );
        
        res.status(200).json({
            status: 'success',
            results: enrichedVisits.length,
            data: enrichedVisits
        });
        
    } catch (err) {
        console.error('Error fetching visit history:', err);
        res.status(500).json({ 
            status: 'error',
            message: err.message || 'Failed to fetch visit history'
        });
    }
};

module.exports = {
    getAllPatients,
    getPatientById,
    getPatientProfile,
    getPatientVisitHistory,
    addPatient,
    updatePatient,
    deletePatient
};
