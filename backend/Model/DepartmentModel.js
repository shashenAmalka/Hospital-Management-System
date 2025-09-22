const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Department name must be at least 2 characters long'],
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Department description is required'],
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  head: {
    type: String,
    trim: true,
    maxlength: [100, 'Department head name cannot exceed 100 characters']
  },
  headStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  positions: {
    type: Map,
    of: Number,
    default: new Map()
  },
  budget: {
    allocated: {
      type: Number,
      default: 0,
      min: [0, 'Budget cannot be negative']
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  location: {
    building: {
      type: String,
      trim: true
    },
    floor: {
      type: String,
      trim: true
    },
    wing: {
      type: String,
      trim: true
    },
    rooms: [{
      type: String,
      trim: true
    }]
  },
  contact: {
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\-\+\(\)\s]*$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    extension: {
      type: String,
      trim: true
    }
  },
  operatingHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  specialties: [{
    type: String,
    trim: true
  }],
  equipment: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be negative']
    },
    status: {
      type: String,
      enum: ['Operational', 'Maintenance', 'Out of Service'],
      default: 'Operational'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  establishedDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance (name index is automatically created by unique: true)
departmentSchema.index({ head: 1 });
departmentSchema.index({ headStaffId: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ 'location.building': 1 });

// Virtual for staff count
departmentSchema.virtual('staffCount', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'department',
  count: true
});

// Virtual for total positions
departmentSchema.virtual('totalPositions').get(function() {
  if (!this.positions) return 0;
  let total = 0;
  this.positions.forEach(count => {
    total += count;
  });
  return total;
});

// Virtual for budget utilization percentage
departmentSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget.allocated || this.budget.allocated === 0) return 0;
  return Math.round((this.budget.spent / this.budget.allocated) * 100);
});

// Pre-save middleware to format name
departmentSchema.pre('save', function(next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  if (this.head) {
    this.head = this.head.trim();
  }
  next();
});

// Instance method to add position
departmentSchema.methods.addPosition = function(positionName, count = 1) {
  if (!this.positions) {
    this.positions = new Map();
  }
  const currentCount = this.positions.get(positionName) || 0;
  this.positions.set(positionName, currentCount + count);
  return this.save();
};

// Instance method to remove position
departmentSchema.methods.removePosition = function(positionName, count = 1) {
  if (!this.positions) return this.save();
  
  const currentCount = this.positions.get(positionName) || 0;
  const newCount = Math.max(0, currentCount - count);
  
  if (newCount === 0) {
    this.positions.delete(positionName);
  } else {
    this.positions.set(positionName, newCount);
  }
  
  return this.save();
};

// Instance method to update budget
departmentSchema.methods.updateBudget = function(allocated, spent) {
  if (allocated !== undefined) this.budget.allocated = allocated;
  if (spent !== undefined) this.budget.spent = spent;
  return this.save();
};

// Static method to find active departments
departmentSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find departments by location
departmentSchema.statics.findByLocation = function(building, floor, wing) {
  const query = { isActive: true };
  if (building) query['location.building'] = building;
  if (floor) query['location.floor'] = floor;
  if (wing) query['location.wing'] = wing;
  return this.find(query);
};

// Static method to get departments with budget issues
departmentSchema.statics.findBudgetIssues = function(threshold = 90) {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $addFields: {
        budgetUtilization: {
          $cond: {
            if: { $gt: ['$budget.allocated', 0] },
            then: { $multiply: [{ $divide: ['$budget.spent', '$budget.allocated'] }, 100] },
            else: 0
          }
        }
      }
    },
    { $match: { budgetUtilization: { $gte: threshold } } }
  ]);
};

// Ensure virtual fields are serialized
departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;