const express = require('express');
const router = express.Router();
const roleController = require('../Controller/RoleController');
// const authMiddleware = require('../middleware/authMiddleware');

// Public routes (you can add auth middleware as needed)
router.route('/')
  .get(roleController.getAllRoles)
  .post(roleController.createRole);

router.route('/stats')
  .get(roleController.getRoleStats);

router.route('/active')
  .get((req, res, next) => {
    req.query.isActive = 'true';
    next();
  }, roleController.getAllRoles);

router.route('/level/:level')
  .get(roleController.getRolesByLevel);

router.route('/permission/:permission')
  .get(roleController.getRolesWithPermission);

router.route('/bulk')
  .post(roleController.bulkCreateRoles)
  .patch(roleController.bulkUpdateRoles);

router.route('/:id')
  .get(roleController.getRole)
  .patch(roleController.updateRole)
  .delete(roleController.deleteRole);

router.route('/:id/toggle-status')
  .patch(roleController.toggleRoleStatus);

module.exports = router;