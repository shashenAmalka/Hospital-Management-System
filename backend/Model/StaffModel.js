const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [
      /^\+?[0-9\s\-()]+$/,
      'Please provide a valid phone number'
    ]
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'cardiology',
      'neurology',
      'orthopedics',
      'pediatrics',
      'radiology',
      'emergency',
      'surgery',
      'icu',
      'laboratory',
      'pharmacy',
      'administration'
    ]
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: [
      'physician',
      'nurse',
      'doctor',
      'department-head',
      'technician',
      'administrator',
      'pharmacist',
      'lab-technician',
      'receptionist'
    ]
  },
  specialization: {
    type: String,
    enum: [
      'cardiology',
      'dermatology',
      'endocrinology',
      'gastroenterology',
      'neurology',
      'oncology',
      'orthopedics',
      'pediatrics',
      'psychiatry',
      'radiology',
      'surgery',
      'urology',
      'emergency-medicine',
      'family-medicine',
      'internal-medicine',
      'obstetrics-gynecology'
    ],
    validate: {
      validator: function(value) {
        // If role is doctor, specialization is required
        if (this.role === 'doctor') {
          return value && value.trim().length > 0;
        }
        // If role is not doctor, specialization should be empty or null
        return !value || value.trim().length === 0;
      },
      message: function(props) {
        if (props.instance.role === 'doctor') {
          return 'Specialization is required for doctors';
        }
        return 'Specialization should only be set for doctors';
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  permissions: [{
    type: String,
    enum: [
      'read_patients',
      'write_patients',
      'read_staff',
      'write_staff',
      'read_appointments',
      'write_appointments',
      'admin_access'
    ]
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
staffSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to handle specialization field
staffSchema.pre('save', function(next) {
  // If role is not doctor, clear specialization
  if (this.role !== 'doctor') {
    this.specialization = undefined;
  }
  next();
});

// Pre-save middleware to hash password
staffSchema.pre('save', async function(next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate employee ID
staffSchema.pre('save', async function(next) {
  if (!this.employeeId && this.isNew) {
    try {
      // Generate employee ID based on department and sequential number
      const deptCode = this.department.substring(0, 3).toUpperCase();
      
      // Find the highest existing employee ID for this department
      const lastStaff = await this.constructor
        .findOne({ 
          employeeId: new RegExp(`^${deptCode}\\d{4}$`) 
        })
        .sort({ employeeId: -1 })
        .select('employeeId');
      
      let nextNumber = 1;
      if (lastStaff && lastStaff.employeeId) {
        const lastNumber = parseInt(lastStaff.employeeId.substring(3));
        nextNumber = lastNumber + 1;
      }
      
      this.employeeId = `${deptCode}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Instance method to check password
staffSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after JWT was issued
staffSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// Static method to get staff by department
staffSchema.statics.findByDepartment = function(department) {
  return this.find({ department, isActive: true });
};

// Static method to get staff by role
staffSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to search staff
staffSchema.statics.searchStaff = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { employeeId: regex },
          { department: regex },
          { role: regex }
        ]
      }
    ]
  });
};

// Index for better performance (email and employeeId indexes are automatically created by unique: true)
staffSchema.index({ department: 1 });
staffSchema.index({ role: 1 });
staffSchema.index({ firstName: 1, lastName: 1 });
staffSchema.index({ createdAt: -1 });

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;