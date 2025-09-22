const Role = require('../Model/RoleModel');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Sample roles for fallback
const sampleRoles = [
  {
    _id: '507f1f77bcf86cd799439021',
    name: 'Doctor',
    description: 'Medical practitioner with patient care responsibilities',
    level: 3,
    permissions: ['read_patient', 'write_patient', 'read_medical_records', 'write_medical_records'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    createdBy: { firstName: 'Admin', lastName: 'User', email: 'admin@hospital.com' }
  },
  {
    _id: '507f1f77bcf86cd799439022',
    name: 'Nurse',
    description: 'Healthcare professional providing patient care',
    level: 2,
    permissions: ['read_patient', 'write_patient', 'read_medical_records'],
    isActive: true,
    createdAt: new Date('2024-01-02'),
    createdBy: { firstName: 'Admin', lastName: 'User', email: 'admin@hospital.com' }
  },
  {
    _id: '507f1f77bcf86cd799439023',
    name: 'Admin',
    description: 'Administrative staff with system management access',
    level: 5,
    permissions: ['read_all', 'write_all', 'delete_all', 'manage_users'],
    isActive: true,
    createdAt: new Date('2024-01-03'),
    createdBy: { firstName: 'System', lastName: 'Admin', email: 'system@hospital.com' }
  }
];

// Get all roles
const getAllRoles = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Check if database is connected
  if (mongoose.connection.readyState !== 1) {
    // Return sample data when no DB connection
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRoles = sampleRoles.slice(startIndex, endIndex);
    
    return res.status(200).json({
      status: 'success',
      message: 'Using sample data (no database connection)',
      results: paginatedRoles.length,
      pagination: {
        page,
        limit,
        total: sampleRoles.length,
        pages: Math.ceil(sampleRoles.length / limit)
      },
      data: {
        roles: paginatedRoles
      }
    });
  }

  const skip = (page - 1) * limit;

  // Build filter object
  const filterObj = {};
  
  if (req.query.level) {
    filterObj.level = req.query.level;
  }
  
  if (req.query.isActive !== undefined) {
    filterObj.isActive = req.query.isActive === 'true';
  }
  
  if (req.query.search) {
    filterObj.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Get roles with pagination
  const roles = await Role.find(filterObj)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'firstName lastName email');
  
  // Get total count for pagination
  const total = await Role.countDocuments(filterObj);
  
  res.status(200).json({
    status: 'success',
    results: roles.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      roles
    }
  });
});

// Get single role
const getRole = catchAsync(async (req, res, next) => {
  const role = await Role.findById(req.params.id).populate('createdBy', 'firstName lastName email');
  
  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      role
    }
  });
});

// Create new role
const createRole = catchAsync(async (req, res, next) => {
  // Check if role with same name already exists
  const existingRole = await Role.findOne({ name: req.body.name });
  if (existingRole) {
    return next(new AppError('Role with this name already exists', 400));
  }
  
  // Add created by if user is authenticated
  if (req.user) {
    req.body.createdBy = req.user.id;
  }
  
  const newRole = await Role.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      role: newRole
    }
  });
});

// Update role
const updateRole = catchAsync(async (req, res, next) => {
  // Check if trying to update name and if name already exists
  if (req.body.name) {
    const existingRole = await Role.findOne({ 
      name: req.body.name,
      _id: { $ne: req.params.id }
    });
    if (existingRole) {
      return next(new AppError('Role with this name already exists', 400));
    }
  }
  
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('createdBy', 'firstName lastName email');
  
  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      role
    }
  });
});

// Delete role
const deleteRole = catchAsync(async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  
  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }
  
  // Check if role is being used by any staff (you might want to add this check)
  // const staffWithRole = await Staff.findOne({ role: role.name.toLowerCase().replace(/\s+/g, '-') });
  // if (staffWithRole) {
  //   return next(new AppError('Cannot delete role that is currently assigned to staff members', 400));
  // }
  
  await Role.findByIdAndDelete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get roles by level
const getRolesByLevel = catchAsync(async (req, res, next) => {
  const { level } = req.params;
  
  const roles = await Role.findByLevel(level);
  
  res.status(200).json({
    status: 'success',
    results: roles.length,
    data: {
      roles
    }
  });
});

// Get roles with specific permission
const getRolesWithPermission = catchAsync(async (req, res, next) => {
  const { permission } = req.params;
  
  const roles = await Role.findWithPermission(permission);
  
  res.status(200).json({
    status: 'success',
    results: roles.length,
    data: {
      roles
    }
  });
});

// Toggle role active status
const toggleRoleStatus = catchAsync(async (req, res, next) => {
  const role = await Role.findById(req.params.id);
  
  if (!role) {
    return next(new AppError('No role found with that ID', 404));
  }
  
  role.isActive = !role.isActive;
  await role.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      role
    }
  });
});

// Get role statistics
const getRoleStats = catchAsync(async (req, res, next) => {
  const stats = await Role.aggregate([
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 },
        activeCount: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  const totalRoles = await Role.countDocuments();
  const activeRoles = await Role.countDocuments({ isActive: true });
  
  res.status(200).json({
    status: 'success',
    data: {
      totalRoles,
      activeRoles,
      levelStats: stats
    }
  });
});

// Bulk operations
const bulkCreateRoles = catchAsync(async (req, res, next) => {
  const { roles } = req.body;
  
  if (!Array.isArray(roles) || roles.length === 0) {
    return next(new AppError('Please provide an array of roles', 400));
  }
  
  // Add createdBy to all roles if user is authenticated
  if (req.user) {
    roles.forEach(role => {
      role.createdBy = req.user.id;
    });
  }
  
  const createdRoles = await Role.insertMany(roles, { ordered: false });
  
  res.status(201).json({
    status: 'success',
    results: createdRoles.length,
    data: {
      roles: createdRoles
    }
  });
});

const bulkUpdateRoles = catchAsync(async (req, res, next) => {
  const { updates } = req.body;
  
  if (!Array.isArray(updates) || updates.length === 0) {
    return next(new AppError('Please provide an array of updates', 400));
  }
  
  const bulkOps = updates.map(update => ({
    updateOne: {
      filter: { _id: update._id },
      update: { $set: update.data },
      upsert: false
    }
  }));
  
  const result = await Role.bulkWrite(bulkOps);
  
  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

module.exports = {
  getAllRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getRolesByLevel,
  getRolesWithPermission,
  toggleRoleStatus,
  getRoleStats,
  bulkCreateRoles,
  bulkUpdateRoles
};