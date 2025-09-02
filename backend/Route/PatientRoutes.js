const express = require('express');
const router = express.Router();
const PatientController = require('../Controller/PatientController');

// Routes for patient management
router.get('/', PatientController.getAllPatients); // Get all patients
router.get('/:id', PatientController.getPatientById); // Get a single patient by ID
router.post('/', PatientController.addPatient); // Add a new patient
router.put('/:id', PatientController.updatePatient); // Update a patient
router.delete('/:id', PatientController.deletePatient); // Delete a patient

module.exports = router;
