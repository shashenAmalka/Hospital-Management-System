const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const {
  getAllLabTests,
  createLabTest,
  updateLabTestResults
} = require('../controllers/labTestController');

router.get('/', verifyToken, getAllLabTests);
router.post('/', verifyToken, checkRole(['admin', 'doctor']), createLabTest);
router.put('/:id/results', verifyToken, checkRole(['admin', 'lab_technician']), updateLabTestResults);

module.exports = router;