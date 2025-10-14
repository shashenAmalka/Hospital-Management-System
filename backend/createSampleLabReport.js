const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import models
const LabReport = require('./Model/LabReportModel');
const LabRequest = require('./Model/LabRequestModel');
const User = require('./Model/UserModel');

const mongoUri = process.env.MONGO_URI || "mongodb+srv://nadeera11:9KhpfPfStDvzr0Qk@cluster0.dyzuhhs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function createSampleLabReport() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find a completed lab request
    const completedLabRequest = await LabRequest.findOne({ status: 'completed' });
    
    if (!completedLabRequest) {
      console.log('❌ No completed lab request found. Creating one...');
      
      // Find a patient
      const patient = await User.findOne({ role: 'patient' });
      if (!patient) {
        console.log('❌ No patient found');
        return;
      }

      // Create a completed lab request
      const labRequest = await LabRequest.create({
        patientId: patient._id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        testType: 'blood',
        priority: 'normal',
        status: 'completed',
        notes: 'Complete blood count test',
        completedAt: new Date(),
        statusHistory: [
          {
            status: 'pending',
            changedBy: patient._id,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            notes: 'Initial request'
          },
          {
            status: 'completed',
            changedBy: patient._id,
            timestamp: new Date(),
            notes: 'Lab report created - request completed'
          }
        ]
      });
      
      console.log('✅ Created completed lab request:', labRequest._id);
      
      // Create a lab report for this request
      const labReport = await LabReport.create({
        labRequestId: labRequest._id,
        patientId: patient._id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        testType: 'blood',
        specimenId: `SPEC-${Date.now()}`,
        specimenType: 'Blood Sample',
        testResults: [
          {
            component: 'Hemoglobin',
            result: '14.2',
            units: 'g/dL',
            referenceRange: '12.0-15.5'
          },
          {
            component: 'White Blood Count',
            result: '7.8',
            units: '10³/µL',
            referenceRange: '4.5-11.0'
          },
          {
            component: 'Platelets',
            result: '285',
            units: '10³/µL',
            referenceRange: '150-450'
          },
          {
            component: 'Glucose',
            result: '92',
            units: 'mg/dL',
            referenceRange: '70-100'
          }
        ],
        technicianNotes: 'All results are within normal limits. No abnormalities detected.',
        createdBy: patient._id // In real scenario this would be lab technician
      });
      
      console.log('✅ Created lab report:', labReport._id);
      console.log('🎉 Sample lab report created successfully!');
      
    } else {
      // Check if a lab report already exists for this request
      const existingReport = await LabReport.findOne({ labRequestId: completedLabRequest._id });
      
      if (existingReport) {
        console.log('✅ Lab report already exists:', existingReport._id);
      } else {
        // Create a lab report for the existing completed request
        const labReport = await LabReport.create({
          labRequestId: completedLabRequest._id,
          patientId: completedLabRequest.patientId,
          patientName: completedLabRequest.patientName,
          testType: completedLabRequest.testType,
          specimenId: `SPEC-${Date.now()}`,
          specimenType: 'Blood Sample',
          testResults: [
            {
              component: 'Hemoglobin',
              result: '13.8',
              units: 'g/dL',
              referenceRange: '12.0-15.5'
            },
            {
              component: 'White Blood Count',
              result: '6.5',
              units: '10³/µL',
              referenceRange: '4.5-11.0'
            },
            {
              component: 'Red Blood Count',
              result: '4.6',
              units: '10⁶/µL',
              referenceRange: '4.2-5.4'
            }
          ],
          technicianNotes: 'Blood work completed. All values within normal range.',
          createdBy: completedLabRequest.patientId // In real scenario this would be lab technician
        });
        
        console.log('✅ Created lab report for existing request:', labReport._id);
        console.log('🎉 Sample lab report created successfully!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating sample lab report:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  }
}

// Run the script
createSampleLabReport();