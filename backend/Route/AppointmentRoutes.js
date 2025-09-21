const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Simple mock controller for appointments
const appointmentController = {
  getAllAppointments: (req, res) => {
    res.status(200).json({ 
      success: true, 
      data: [] 
    });
  },
  
  getAppointmentById: (req, res) => {
    res.status(200).json({ 
      success: true, 
      data: { 
        id: req.params.id,
        patientName: 'Sample Patient',
        doctorName: 'Dr. Sample',
        date: new Date(),
        time: '10:00 AM',
        status: 'scheduled'
      } 
    });
  },
  
  createAppointment: (req, res) => {
    res.status(201).json({ 
      success: true, 
      message: 'Appointment created successfully',
      data: { 
        id: 'new-id',
        ...req.body,
        createdAt: new Date()
      }
    });
  },
  
  updateAppointment: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        id: req.params.id,
        ...req.body,
        updatedAt: new Date()
      }
    });
  },
  
  deleteAppointment: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  }
};

// Routes
router.get('/', verifyToken, appointmentController.getAllAppointments);
router.get('/:id', verifyToken, appointmentController.getAppointmentById);
router.post('/', verifyToken, appointmentController.createAppointment);
router.put('/:id', verifyToken, appointmentController.updateAppointment);
router.delete('/:id', verifyToken, appointmentController.deleteAppointment);

module.exports = router;
