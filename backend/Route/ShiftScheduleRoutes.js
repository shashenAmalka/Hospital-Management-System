const express = require('express');
const shiftScheduleController = require('../Controller/ShiftScheduleController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes - require authentication
router.use(verifyToken);

// Routes for shift schedule management
router
  .route('/')
  .get(shiftScheduleController.getSchedulesByWeek)
  .post(shiftScheduleController.createOrUpdateSchedule);

router
  .route('/bulk')
  .put(shiftScheduleController.bulkUpdateSchedules);

router
  .route('/publish')
  .post(shiftScheduleController.publishSchedules);

router
  .route('/unpublish')
  .post(checkRole(['admin']), shiftScheduleController.unpublishSchedules);

router
  .route('/availability')
  .get(shiftScheduleController.getStaffAvailability);

router
  .route('/export/pdf')
  .get(shiftScheduleController.exportSchedulePDF);

router
  .route('/stats')
  .get(shiftScheduleController.getScheduleStats);

router
  .route('/:id')
  .delete(shiftScheduleController.deleteSchedule);

module.exports = router;