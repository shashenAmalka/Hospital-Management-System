const Staff = require('../Model/StaffModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create new staff member
const createStaff = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    department,
    role,
    status = 'active',
    password,
    address,
    emergencyContact
  } = req.body;

  // Check if staff with email already exists
  const existingStaff = await Staff.findOne({ email });
  if (existingStaff) {
    return next(new AppError('Staff member with this email already exists', 400));
  }

  // Create new staff member
  const newStaff = await Staff.create({
    firstName,
    lastName,
    email,
    phone,
    department,
    role,
    status,
    password,
    address,
    emergencyContact,
    createdBy: req.user?.id // Assuming user is authenticated
  });

  // Remove password from output
  newStaff.password = undefined;

  res.status(201).json({
    status: 'success',
    message: 'Staff member created successfully',
    data: {
      staff: newStaff
    }
  });
});

// Get all staff members
const getAllStaff = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    department,
    role,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = { isActive: true };
  
  if (department && department !== 'all') {
    filter.department = department;
  }
  
  if (role && role !== 'all') {
    filter.role = role;
  }
  
  if (status && status !== 'all') {
    filter.status = status;
  }

  // Build search query
  let query = Staff.find(filter);

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query = query.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex }
      ]
    });
  }

  // Apply sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  query = query.sort(sortOptions);

  // Apply pagination
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(parseInt(limit));

  // Execute query
  const staff = await query.select('-password');
  
  // Get total count for pagination
  const total = await Staff.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: staff.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      staff
    }
  });
});

// Get staff member by ID
const getStaffById = catchAsync(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id).select('-password');

  if (!staff) {
    return next(new AppError('No staff member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      staff
    }
  });
});

// Update staff member
const updateStaff = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    department,
    role,
    status,
    address,
    emergencyContact
  } = req.body;

  // Check if staff exists
  const staff = await Staff.findById(req.params.id);
  if (!staff) {
    return next(new AppError('No staff member found with that ID', 404));
  }

  // Check if email is being changed and if it already exists
  if (email && email !== staff.email) {
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return next(new AppError('Staff member with this email already exists', 400));
    }
  }

  // Update staff member
  const updatedStaff = await Staff.findByIdAndUpdate(
    req.params.id,
    {
      firstName,
      lastName,
      email,
      phone,
      department,
      role,
      status,
      address,
      emergencyContact,
      updatedBy: req.user?.id
    },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    message: 'Staff member updated successfully',
    data: {
      staff: updatedStaff
    }
  });
});

// Delete staff member (soft delete)
const deleteStaff = catchAsync(async (req, res, next) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    return next(new AppError('No staff member found with that ID', 404));
  }

  // Soft delete by setting isActive to false
  await Staff.findByIdAndUpdate(req.params.id, { 
    isActive: false,
    updatedBy: req.user?.id
  });

  res.status(204).json({
    status: 'success',
    message: 'Staff member deleted successfully',
    data: null
  });
});

// Get staff statistics
const getStaffStats = catchAsync(async (req, res, next) => {
  const stats = await Staff.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalStaff: { $sum: 1 },
        activeStaff: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        inactiveStaff: {
          $sum: {
            $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0]
          }
        },
        onLeaveStaff: {
          $sum: {
            $cond: [{ $eq: ['$status', 'on-leave'] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Get department-wise stats
  const departmentStats = await Staff.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
        activeCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get role-wise stats
  const roleStats = await Staff.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: stats[0] || {
        totalStaff: 0,
        activeStaff: 0,
        inactiveStaff: 0,
        onLeaveStaff: 0
      },
      departmentStats,
      roleStats
    }
  });
});

// Search staff members
const searchStaff = catchAsync(async (req, res, next) => {
  const { q: searchTerm } = req.query;

  if (!searchTerm) {
    return next(new AppError('Search term is required', 400));
  }

  const staff = await Staff.searchStaff(searchTerm).select('-password').limit(20);

  res.status(200).json({
    status: 'success',
    results: staff.length,
    data: {
      staff
    }
  });
});

// Get staff by department
const getStaffByDepartment = catchAsync(async (req, res, next) => {
  const { department } = req.params;
  
  const staff = await Staff.findByDepartment(department).select('-password');

  res.status(200).json({
    status: 'success',
    results: staff.length,
    data: {
      staff
    }
  });
});

// Get staff by role
const getStaffByRole = catchAsync(async (req, res, next) => {
  const { role } = req.params;
  
  const staff = await Staff.findByRole(role).select('-password');

  res.status(200).json({
    status: 'success',
    results: staff.length,
    data: {
      staff
    }
  });
});

// Update staff password
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Check if staff exists and get password
  const staff = await Staff.findById(req.params.id).select('+password');
  if (!staff) {
    return next(new AppError('No staff member found with that ID', 404));
  }

  // Check if current password is correct
  if (!(await staff.correctPassword(currentPassword, staff.password))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Check if new passwords match
  if (newPassword !== confirmPassword) {
    return next(new AppError('New passwords do not match', 400));
  }

  // Update password
  staff.password = newPassword;
  staff.updatedBy = req.user?.id;
  await staff.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
});

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffStats,
  searchStaff,
  getStaffByDepartment,
  getStaffByRole,
  updatePassword
};