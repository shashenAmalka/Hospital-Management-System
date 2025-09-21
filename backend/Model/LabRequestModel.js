const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: String,
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: String
});

const labRequestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  patientName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'emergency'],
    default: 'normal'
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed'],
    default: 'pending'
  },
  statusHistory: [statusHistorySchema],
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Check if a request can be edited (must be pending and within 1 hour of creation)
labRequestSchema.methods.canEdit = function() {
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  return (
    this.status === 'pending' && 
    (Date.now() - this.createdAt.getTime() <= oneHour)
  );
};

// Method to delete a note from status history
labRequestSchema.methods.deleteStatusNote = async function(noteId) {
  this.statusHistory = this.statusHistory.filter(
    history => history._id.toString() !== noteId.toString()
  );
  return await this.save();
};

// Method to edit a note in status history
labRequestSchema.methods.editStatusNote = async function(noteId, newNote) {
  const historyEntry = this.statusHistory.find(
    history => history._id.toString() === noteId.toString()
  );
  if (!historyEntry) {
    throw new Error('Note not found');
  }
  historyEntry.notes = newNote;
  return await this.save();
};

// Prevent duplicate model registration
module.exports = mongoose.models.LabRequest || mongoose.model('LabRequest', labRequestSchema);
};

module.exports = mongoose.model('LabRequest', labRequestSchema);
