const express = require('express');
const router = express.Router();
const PatientController = require('../Controller/PatientController');

try {
  // Check if middleware exists
  let verifyToken;
  try {
    const auth = require('../middleware/authMiddleware');
    verifyToken = auth.verifyToken;
  } catch (middlewareError) {
    console.warn('⚠️ Auth middleware not found for patients, using passthrough');
    verifyToken = (req, res, next) => next();
  }

  // Simple, clean route definitions
  router.get('/', PatientController.getAllPatients);
  router.get('/:id', PatientController.getPatientById);
  router.post('/', PatientController.addPatient);
  router.put('/:id', PatientController.updatePatient);
  router.delete('/:id', PatientController.deletePatient);
  
  console.log('✅ Patient routes defined successfully');
} catch (error) {
  console.error('❌ Error in PatientRoutes:', error.message);
  throw error;
}

module.exports = router;
module.exports = router;
