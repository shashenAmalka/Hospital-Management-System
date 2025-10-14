const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  component: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  referenceRange: String,
  units: String
});

const labReportSchema = new mongoose.Schema({
  labRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabRequest',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  specimenId: {
    type: String,
    required: true
  },
  specimenType: {
    type: String,
    required: true
  },
  testResults: [testResultSchema],
  technicianNotes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true }); // This adds createdAt and updatedAt fields automatically

// Check if a report can be updated (within 20 minutes of creation)
labReportSchema.methods.canUpdate = function() {
  if (!this.createdAt) return false;
  
  const currentTime = new Date();
  const creationTime = new Date(this.createdAt);
  const timeDifferenceMs = currentTime - creationTime;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  
  // Return true if the time difference is less than or equal to 20 minutes
  return timeDifferenceMinutes <= 20;
};

// Check if a report can be updated (within 20 minutes of creation)
labReportSchema.methods.canUpdate = function() {
  if (!this.createdAt) return false;
  
  const currentTime = new Date();
  const creationTime = new Date(this.createdAt);
  const timeDifferenceMs = currentTime - creationTime;
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60);
  
  // Return true if the time difference is less than or equal to 20 minutes
  return timeDifferenceMinutes <= 20;
};

const LabReport = mongoose.model('LabReport', labReportSchema);

module.exports = LabReport;