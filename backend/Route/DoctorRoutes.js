const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
  getAllDoctors,
  getDoctorById,
  updateDoctorSchedule
} = require('../controllers/doctorController');

router.get('/', verifyToken, getAllDoctors);
router.get('/:id', verifyToken, getDoctorById);
router.put('/:id/schedule', verifyToken, checkRole(['admin', 'doctor']), updateDoctorSchedule);

module.exports = router;