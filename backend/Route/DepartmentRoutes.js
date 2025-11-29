const express = require('express');
const router = express.Router();
const departmentController = require('../Controller/DepartmentController');
// const authMiddleware = require('../middleware/authMiddleware');

// Public routes (you can add auth middleware as needed)
router.route('/')
  .get(departmentController.getAllDepartments)
  .post(departmentController.createDepartment);

router.route('/stats')
  .get(departmentController.getDepartmentStats);

router.route('/overview')
  .get(departmentController.getDepartmentOverview);

router.route('/active')
  .get(departmentController.getActiveDepartments);

router.route('/by-location')
  .get(departmentController.getDepartmentsByLocation);

router.route('/budget-issues')
  .get(departmentController.getDepartmentsWithBudgetIssues);

router.route('/bulk')
  .post(departmentController.bulkCreateDepartments);

router.route('/:id')
  .get(departmentController.getDepartment)
  .patch(departmentController.updateDepartment)
  .delete(departmentController.deleteDepartment);

router.route('/:id/budget')
  .patch(departmentController.updateDepartmentBudget);

router.route('/:id/positions/add')
  .patch(departmentController.addPosition);

router.route('/:id/positions/remove')
  .patch(departmentController.removePosition);

router.route('/:id/toggle-status')
  .patch(departmentController.toggleDepartmentStatus);

module.exports = router;