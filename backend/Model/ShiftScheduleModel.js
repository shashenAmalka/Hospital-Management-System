const mongoose = require('mongoose');

const shiftScheduleSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  schedule: {
    monday: {
      type: String,
      enum: ['morning', 'evening', 'night', 'on-call', 'off-duty'],
      default: 'off-duty'
    },
    tuesday: {
      type: String,
      enum: ['morning', 'evening', 'night', 'on-call', 'off-duty'],
      default: 'off-duty'
    },
    wednesday: {
      type: String,
      enum: ['morning', 'evening', 'night', 'on-call', 'off-duty'],
      default: 'off-duty'
    },
    thursday: {
      type: String,
      enum: ['morning', 'evening', 'night', 'on-call', 'off-duty'],
      default: 'off-duty'
    },
    friday: {
      type: String,
      enum: ['morning', 'evening', 'night', 'on-call', 'off-duty'],
      default: 'off-duty'
    },
    saturday: {
      type: String,
      enum: ['morning', 'evening', 'night', 'on-call', 'off-duty'],
      default: 'off-duty'
    },
    sunday: {
      type: String,
      enum: ['morning', 'evening', 'night', 'on-call', 'off-duty'],
      default: 'off-duty'
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Compound index to ensure one schedule per staff per week
shiftScheduleSchema.index({ staffId: 1, weekStartDate: 1 }, { unique: true });

// Index for efficient department-based queries
shiftScheduleSchema.index({ departmentId: 1, weekStartDate: 1 });

// Index for published schedules
shiftScheduleSchema.index({ isPublished: 1, weekStartDate: 1 });

// Virtual for week identification
shiftScheduleSchema.virtual('weekIdentifier').get(function() {
  return `${this.weekStartDate.toISOString().split('T')[0]}_${this.weekEndDate.toISOString().split('T')[0]}`;
});

// Method to check if schedule can be modified
shiftScheduleSchema.methods.canModify = function() {
  return !this.isPublished;
};

// Method to publish schedule
shiftScheduleSchema.methods.publish = function(publishedBy) {
  this.isPublished = true;
  this.publishedAt = new Date();
  this.publishedBy = publishedBy;
  return this.save();
};

// Method to unpublish schedule (if needed for admin override)
shiftScheduleSchema.methods.unpublish = function() {
  this.isPublished = false;
  this.publishedAt = null;
  this.publishedBy = null;
  return this.save();
};

// Static method to get schedules by week and department
shiftScheduleSchema.statics.getSchedulesByWeek = function(weekStartDate, departmentId = null) {
  const query = { weekStartDate };
  if (departmentId) {
    query.departmentId = departmentId;
  }
  
  return this.find(query)
    .populate('staffId', 'firstName lastName email position')
    .populate('departmentId', 'name')
    .populate('createdBy', 'firstName lastName')
    .populate('lastModifiedBy', 'firstName lastName')
    .populate('publishedBy', 'firstName lastName')
    .sort({ 'staffId.lastName': 1, 'staffId.firstName': 1 });
};

// Static method to get published schedules
shiftScheduleSchema.statics.getPublishedSchedules = function(weekStartDate, departmentId = null) {
  const query = { weekStartDate, isPublished: true };
  if (departmentId) {
    query.departmentId = departmentId;
  }
  
  return this.find(query)
    .populate('staffId', 'firstName lastName email position')
    .populate('departmentId', 'name')
    .sort({ 'staffId.lastName': 1, 'staffId.firstName': 1 });
};

// Static method to bulk create or update schedules
shiftScheduleSchema.statics.bulkUpsertSchedules = async function(schedules, userId) {
  const operations = [];
  
  for (const schedule of schedules) {
    // Ensure weekEndDate is calculated if not provided
    const weekEndDate = schedule.weekEndDate || (() => {
      const endDate = new Date(schedule.weekStartDate);
      endDate.setDate(endDate.getDate() + 6);
      return endDate;
    })();

    // Check if document exists
    const existing = await this.findOne({
      staffId: schedule.staffId,
      weekStartDate: schedule.weekStartDate
    });

    if (existing) {
      // Update existing document - increment version
      operations.push({
        updateOne: {
          filter: { 
            staffId: schedule.staffId, 
            weekStartDate: schedule.weekStartDate 
          },
          update: {
            $set: {
              staffId: schedule.staffId,
              departmentId: schedule.departmentId,
              weekStartDate: schedule.weekStartDate,
              weekEndDate: weekEndDate,
              schedule: schedule.schedule,
              notes: schedule.notes || '',
              lastModifiedBy: userId
            },
            $inc: { version: 1 }
          }
        }
      });
    } else {
      // Insert new document - set version to 1
      operations.push({
        updateOne: {
          filter: { 
            staffId: schedule.staffId, 
            weekStartDate: schedule.weekStartDate 
          },
          update: {
            $set: {
              staffId: schedule.staffId,
              departmentId: schedule.departmentId,
              weekStartDate: schedule.weekStartDate,
              weekEndDate: weekEndDate,
              schedule: schedule.schedule,
              notes: schedule.notes || '',
              lastModifiedBy: userId,
              createdBy: userId,
              isPublished: false,
              version: 1
            }
          },
          upsert: true
        }
      });
    }
  }
  
  return this.bulkWrite(operations);
};

// Pre-save middleware to calculate week end date
shiftScheduleSchema.pre('save', function(next) {
  if (this.weekStartDate && !this.weekEndDate) {
    const endDate = new Date(this.weekStartDate);
    endDate.setDate(endDate.getDate() + 6);
    this.weekEndDate = endDate;
  }
  next();
});

// Pre-save middleware to prevent modification of published schedules
shiftScheduleSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified() && this.isPublished && !this.isModified('isPublished')) {
    return next(new Error('Cannot modify published schedule'));
  }
  next();
});

const ShiftSchedule = mongoose.model('ShiftSchedule', shiftScheduleSchema);

module.exports = ShiftSchedule;