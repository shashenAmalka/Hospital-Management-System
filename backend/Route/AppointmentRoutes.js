const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

router.get('/', verifyToken, getAllAppointments);
router.post('/', verifyToken, checkRole(['admin', 'patient']), createAppointment);
router.put('/:id/status', verifyToken, checkRole(['admin', 'doctor']), updateAppointmentStatus);

module.exports = router;