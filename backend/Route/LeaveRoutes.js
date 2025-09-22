const express = require('express');
const router = express.Router();
const { 
  createLeaveRequest,
  getDoctorLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  getAllLeaveRequests,
  reviewLeaveRequest
} = require('../Controller/LeaveController');
const { verifyToken } = require('../middleware/authMiddleware');

// Doctor routes - require authentication
router.get('/test', (req, res) => {
  res.json({ message: 'Leave routes working' });
});
router.post('/request', verifyToken, createLeaveRequest);
router.get('/my-requests', verifyToken, getDoctorLeaveRequests);
router.get('/request/:id', verifyToken, getLeaveRequestById);
router.put('/request/:id', verifyToken, updateLeaveRequest);
router.delete('/request/:id', verifyToken, deleteLeaveRequest);

// Admin routes - require authentication and admin role
router.get('/all', verifyToken, getAllLeaveRequests);
router.put('/review/:id', verifyToken, reviewLeaveRequest);

module.exports = router;