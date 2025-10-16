const express = require('express');
const router = express.Router();
const prescriptionController = require('../Controller/PrescriptionController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Prescription Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Authentication middleware (optional - add if auth is available)
let verifyToken;
try {
  const auth = require('../middleware/authMiddleware');
  verifyToken = auth.verifyToken;
} catch (middlewareError) {
  console.warn('⚠️ Auth middleware not found for prescriptions, using passthrough');
  verifyToken = (req, res, next) => next();
}

// Routes
router.get('/', prescriptionController.getAllPrescriptions);
router.get('/pharmacy', prescriptionController.getPrescriptionsForPharmacy);
router.get('/patient/:patientId', prescriptionController.getPrescriptionsByPatient);
router.get('/doctor/:doctorId', prescriptionController.getPrescriptionsByDoctor);
router.get('/:id', prescriptionController.getPrescriptionById);

router.post('/', prescriptionController.createPrescription);
router.put('/:id', prescriptionController.updatePrescription);
router.patch('/:id/send-to-pharmacy', prescriptionController.sendToPharmacy);
router.patch('/:id/status', prescriptionController.updatePrescriptionStatus);
router.delete('/:id', prescriptionController.deletePrescription);

module.exports = router;
