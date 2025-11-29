const express = require('express');
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffStats,
  searchStaff,
  getStaffByDepartment,
  getStaffByRole,
  updatePassword,
  getStaffOverview,
  getStaffStatusCounts
} = require('../Controller/StaffController');

const router = express.Router();

// Staff routes
router.route('/')
  .get(getAllStaff)
  .post(createStaff);

router.route('/stats')
  .get(getStaffStats);

router.route('/status-counts')
  .get(getStaffStatusCounts);

router.route('/overview')
  .get(getStaffOverview);

router.route('/search')
  .get(searchStaff);

router.route('/department/:department')
  .get(getStaffByDepartment);

router.route('/role/:role')
  .get(getStaffByRole);

router.route('/:id')
  .get(getStaffById)
  .patch(updateStaff)
  .delete(deleteStaff);

router.route('/:id/password')
  .patch(updatePassword);

module.exports = router;