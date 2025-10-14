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

module.exports = {
    getAllPatients,
    getPatientById,
    getPatientProfile,
    addPatient,
    updatePatient,
    deletePatient
};
