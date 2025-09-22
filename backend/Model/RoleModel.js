const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Role name must be at least 2 characters long'],
    maxlength: [50, 'Role name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  permissions: [{
    type: String,
    required: true,
    enum: [
      'Full department access',
      'Approve staff schedules',
      'Approve leave requests',
      'View department reports',
      'Manage department budget',
      'Patient diagnosis and treatment',
      'Supervise junior staff',
      'Access to medical records',
      'Limited budget approval',
      'Equipment management',
      'Inventory management',
      'User management',
      'Staff management',
      'Patient management',
      'Appointment management',
      'Medical records access',
      'Billing access',
      'Report generation',
      'System configuration'
    ]
  }],
  level: {
    type: String,
    enum: ['Junior', 'Staff', 'Senior', 'Manager', 'Director', 'Executive'],
    default: 'Staff'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance (name index is automatically created by unique: true)
roleSchema.index({ level: 1 });
roleSchema.index({ isActive: 1 });

// Pre-save middleware to format name
roleSchema.pre('save', function(next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});

// Instance method to check if role has specific permission
roleSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Static method to find roles by level
roleSchema.statics.findByLevel = function(level) {
  return this.find({ level, isActive: true });
};

// Static method to get roles with specific permissions
roleSchema.statics.findWithPermission = function(permission) {
  return this.find({ 
    permissions: { $in: [permission] }, 
    isActive: true 
  });
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;