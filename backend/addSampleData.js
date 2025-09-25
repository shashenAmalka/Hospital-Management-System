const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('./Model/UserModel');
const Appointment = require('./Model/AppointmentModel');
const LabRequest = require('./Model/LabRequestModel');
const Staff = require('./Model/StaffModel');
const Department = require('./Model/DepartmentModel');

const mongoUri = process.env.MONGO_URI || "mongodb+srv://nadeera11:9KhpfPfStDvzr0Qk@cluster0.dyzuhhs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function addSampleData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Patient ID from the logs
    const patientId = '68d02c134a6b1aa68fbceb8d';
    
    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      console.log('❌ Patient not found with ID:', patientId);
      return;
    }
    console.log('✅ Found patient:', patient.firstName, patient.lastName);

    // Create or find a department
    let department = await Department.findOne({ name: 'Cardiology' });
    if (!department) {
      department = await Department.create({
        name: 'Cardiology',
        description: 'Heart and cardiovascular health',
        isActive: true
      });
      console.log('✅ Created department:', department.name);
    }

    // Create or find a doctor (staff member)
    let doctor = await Staff.findOne({ firstName: 'Dr. John' });
    if (!doctor) {
      doctor = await Staff.create({
        firstName: 'Dr. John',
        lastName: 'Smith',
        email: 'dr.john@hospital.com',
        phone: '+1234567890',
        department: 'cardiology',
        role: 'doctor',
        specialization: 'cardiology',
        password: 'password123',
        employeeId: 'DOC001',
        isActive: true
      });
      console.log('✅ Created doctor:', doctor.firstName, doctor.lastName);
    }

    // Create sample appointments
    const appointments = [
      {
        patient: patientId,
        doctor: doctor._id,
        department: department._id,
        appointmentDate: new Date('2025-09-25'),
        appointmentTime: '10:00',
        type: 'consultation',
        status: 'scheduled',
        reason: 'Regular heart checkup',
        notes: 'Patient requested routine cardiovascular examination'
      },
      {
        patient: patientId,
        doctor: doctor._id,
        department: department._id,
        appointmentDate: new Date('2025-09-15'),
        appointmentTime: '14:30',
        type: 'follow-up',
        status: 'completed',
        reason: 'Follow-up on previous test results',
        diagnosis: 'Normal heart function',
        treatment: 'Continue current medication'
      },
      {
        patient: patientId,
        doctor: doctor._id,
        department: department._id,
        appointmentDate: new Date('2025-10-02'),
        appointmentTime: '09:15',
        type: 'consultation',
        status: 'confirmed',
        reason: 'Chest pain evaluation',
        symptoms: 'Mild chest discomfort during exercise'
      }
    ];

    // Clear existing appointments for this patient
    await Appointment.deleteMany({ patient: patientId });
    
    // Create new appointments
    const createdAppointments = await Appointment.create(appointments);
    console.log('✅ Created', createdAppointments.length, 'sample appointments');

    // Create sample lab requests
    const labRequests = [
      {
        patientId: patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        testType: 'Blood Test',
        priority: 'normal',
        status: 'pending',
        notes: 'Complete blood count and lipid profile',
        requestedBy: doctor._id,
        requestDate: new Date()
      },
      {
        patientId: patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        testType: 'ECG',
        priority: 'urgent',
        status: 'completed',
        notes: 'Electrocardiogram for chest pain evaluation',
        requestedBy: doctor._id,
        requestDate: new Date('2025-09-10'),
        completedDate: new Date('2025-09-12'),
        results: 'Normal sinus rhythm, no abnormalities detected'
      }
    ];

    // Clear existing lab requests for this patient
    await LabRequest.deleteMany({ patientId: patientId });
    
    // Create new lab requests
    const createdLabRequests = await LabRequest.create(labRequests);
    console.log('✅ Created', createdLabRequests.length, 'sample lab requests');

    console.log('🎉 Sample data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
}

// Run the script
addSampleData();