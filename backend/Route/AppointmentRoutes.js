const express = require('express');
const router = express.Router();
const appointmentController = require('../Controller/AppointmentController');

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Appointment Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Authentication middleware (optional - add if auth is available)
let verifyToken;
try {
  const auth = require('../middleware/authMiddleware');
  verifyToken = auth.verifyToken;
} catch (middlewareError) {
  console.warn('⚠️ Auth middleware not found for appointments, using passthrough');
  verifyToken = (req, res, next) => next();
}

// Routes
router.get('/', appointmentController.getAllAppointments);
router.get('/today', appointmentController.getTodayAppointments);
router.get('/upcoming', appointmentController.getUpcomingAppointments);
router.get('/user/:userId', appointmentController.getAppointmentsByUser);
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);
router.get('/doctor/:doctorId/patients', appointmentController.getDoctorPatients);
router.get('/:id', appointmentController.getAppointmentById);

router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;