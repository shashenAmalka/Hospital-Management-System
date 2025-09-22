const Department = require('../Model/DepartmentModel');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Sample departments for fallback
const sampleDepartments = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Emergency Medicine',
    description: 'Emergency care and trauma services',
    head: 'Dr. Sarah Johnson',
    budget: 2500000,
    staff: 45,
    location: { building: 'Main Hospital', floor: '1st Floor' },
    isActive: true,
    createdAt: new Date('2024-01-01'),
    headStaffId: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@hospital.com', employeeId: 'EMP001' }
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Cardiology',
    description: 'Heart and cardiovascular care',
    head: 'Dr. Michael Chen',
    budget: 3000000,
    staff: 38,
    location: { building: 'Main Hospital', floor: '3rd Floor' },
    isActive: true,
    createdAt: new Date('2024-01-02'),
    headStaffId: { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@hospital.com', employeeId: 'EMP002' }
  }
];

// Get all departments
const getAllDepartments = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Check if database is connected
  if (mongoose.connection.readyState !== 1) {
    // Return sample data when no DB connection
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDepartments = sampleDepartments.slice(startIndex, endIndex);
    
    return res.status(200).json({
      status: 'success',
      message: 'Using sample data (no database connection)',
      results: paginatedDepartments.length,
      pagination: {
        page,
        limit,
        total: sampleDepartments.length,
        pages: Math.ceil(sampleDepartments.length / limit)
      },
      data: {
        departments: paginatedDepartments
      }
    });
  }

  const skip = (page - 1) * limit;

  // Build filter object
  const filterObj = {};
  
  if (req.query.isActive !== undefined) {
    filterObj.isActive = req.query.isActive === 'true';
  }
  
  if (req.query.building) {
    filterObj['location.building'] = req.query.building;
  }
  
  if (req.query.floor) {
    filterObj['location.floor'] = req.query.floor;
  }
  
  if (req.query.search) {
    filterObj.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { head: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Get departments with pagination
  const departments = await Department.find(filterObj)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('headStaffId', 'firstName lastName email employeeId')
    .populate('createdBy', 'firstName lastName email')
    .populate('staffCount');
  
  // Get total count for pagination
  const total = await Department.countDocuments(filterObj);
  
  res.status(200).json({
    status: 'success',
    results: departments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      departments
    }
  });
});

// Get single department
const getDepartment = catchAsync(async (req, res, next) => {
  // Check if database is connected
  if (mongoose.connection.readyState !== 1) {
    // Return sample data when no DB connection
    const department = sampleDepartments.find(dept => dept._id === req.params.id);
    
    if (!department) {
      return next(new AppError('No department found with that ID', 404));
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Using sample data (no database connection)',
      data: {
        department
      }
    });
  }

  const department = await Department.findById(req.params.id)
    .populate('headStaffId', 'firstName lastName email employeeId phoneNumber')
    .populate('createdBy', 'firstName lastName email')
    .populate('staffCount');
  
  if (!department) {
    return next(new AppError('No department found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      department
    }
  });
});

// Create new department
const createDepartment = catchAsync(async (req, res, next) => {
  // Check if department with same name already exists
  const existingDepartment = await Department.findOne({ name: req.body.name });
  if (existingDepartment) {
    return next(new AppError('Department with this name already exists', 400));
  }
  
  // Add created by if user is authenticated
  if (req.user) {
    req.body.createdBy = req.user.id;
  }
  
  const newDepartment = await Department.create(req.body);
  
  // Populate the created department
  const populatedDepartment = await Department.findById(newDepartment._id)
    .populate('headStaffId', 'firstName lastName email employeeId')
    .populate('createdBy', 'firstName lastName email');
  
  res.status(201).json({
    status: 'success',
    data: {
      department: populatedDepartment
    }
  });
});

// Update department
const updateDepartment = catchAsync(async (req, res, next) => {
  // Check if trying to update name and if name already exists
  if (req.body.name) {
    const existingDepartment = await Department.findOne({ 
      name: req.body.name,
      _id: { $ne: req.params.id }
    });
    if (existingDepartment) {
      return next(new AppError('Department with this name already exists', 400));
    }
  }
  
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('headStaffId', 'firstName lastName email employeeId')
    .populate('createdBy', 'firstName lastName email')
    .populate('staffCount');
  
  if (!department) {
    return next(new AppError('No department found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      department
    }
  });
});

// Delete department
const deleteDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findById(req.params.id).populate('staffCount');
  
  if (!department) {
    return next(new AppError('No department found with that ID', 404));
  }
  
  // Check if department has staff members
  if (department.staffCount > 0) {
    return next(new AppError('Cannot delete department that has staff members. Please reassign staff first.', 400));
  }
  
  await Department.findByIdAndDelete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get departments by location
const getDepartmentsByLocation = catchAsync(async (req, res, next) => {
  const { building, floor, wing } = req.query;
  
  const departments = await Department.findByLocation(building, floor, wing)
    .populate('headStaffId', 'firstName lastName email employeeId')
    .populate('staffCount');
  
  res.status(200).json({
    status: 'success',
    results: departments.length,
    data: {
      departments
    }
  });
});

// Get department statistics
const getDepartmentStats = catchAsync(async (req, res, next) => {
  const totalDepartments = await Department.countDocuments();
  const activeDepartments = await Department.countDocuments({ isActive: true });
  
  // Budget statistics
  const budgetStats = await Department.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalAllocated: { $sum: '$budget.allocated' },
        totalSpent: { $sum: '$budget.spent' },
        avgUtilization: {
          $avg: {
            $cond: {
              if: { $gt: ['$budget.allocated', 0] },
              then: { $multiply: [{ $divide: ['$budget.spent', '$budget.allocated'] }, 100] },
              else: 0
            }
          }
        }
      }
    }
  ]);
  
  // Staff distribution by department
  const staffDistribution = await Department.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'staff',
        localField: '_id',
        foreignField: 'department',
        as: 'staff'
      }
    },
    {
      $project: {
        name: 1,
        staffCount: { $size: '$staff' },
        totalPositions: {
          $reduce: {
            input: { $objectToArray: '$positions' },
            initialValue: 0,
            in: { $add: ['$$value', '$$this.v'] }
          }
        }
      }
    },
    { $sort: { staffCount: -1 } }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      totalDepartments,
      activeDepartments,
      budgetStats: budgetStats[0] || { totalAllocated: 0, totalSpent: 0, avgUtilization: 0 },
      staffDistribution
    }
  });
});

// Update department budget
const updateDepartmentBudget = catchAsync(async (req, res, next) => {
  const { allocated, spent } = req.body;
  
  const department = await Department.findById(req.params.id);
  if (!department) {
    return next(new AppError('No department found with that ID', 404));
  }
  
  await department.updateBudget(allocated, spent);
  
  res.status(200).json({
    status: 'success',
    data: {
      department
    }
  });
});

// Add position to department
const addPosition = catchAsync(async (req, res, next) => {
  const { positionName, count = 1 } = req.body;
  
  if (!positionName) {
    return next(new AppError('Position name is required', 400));
  }
  
  const department = await Department.findById(req.params.id);
  if (!department) {
    return next(new AppError('No department found with that ID', 404));
  }
  
  await department.addPosition(positionName, count);
  
  res.status(200).json({
    status: 'success',
    data: {
      department
    }
  });
});

// Remove position from department
const removePosition = catchAsync(async (req, res, next) => {
  const { positionName, count = 1 } = req.body;
  
  if (!positionName) {
    return next(new AppError('Position name is required', 400));
  }
  
  const department = await Department.findById(req.params.id);
  if (!department) {
    return next(new AppError('No department found with that ID', 404));
  }
  
  await department.removePosition(positionName, count);
  
  res.status(200).json({
    status: 'success',
    data: {
      department
    }
  });
});

// Get departments with budget issues
const getDepartmentsWithBudgetIssues = catchAsync(async (req, res, next) => {
  const threshold = parseInt(req.query.threshold, 10) || 90;
  
  const departments = await Department.findBudgetIssues(threshold);
  
  res.status(200).json({
    status: 'success',
    results: departments.length,
    data: {
      departments
    }
  });
});

// Toggle department active status
const toggleDepartmentStatus = catchAsync(async (req, res, next) => {
  const department = await Department.findById(req.params.id);
  
  if (!department) {
    return next(new AppError('No department found with that ID', 404));
  }
  
  department.isActive = !department.isActive;
  await department.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      department
    }
  });
});

// Get all active departments (simple list for dropdowns)
const getActiveDepartments = catchAsync(async (req, res, next) => {
  const departments = await Department.findActive()
    .select('name description head')
    .sort({ name: 1 });
  
  res.status(200).json({
    status: 'success',
    results: departments.length,
    data: {
      departments
    }
  });
});

// Bulk operations
const bulkCreateDepartments = catchAsync(async (req, res, next) => {
  const { departments } = req.body;
  
  if (!Array.isArray(departments) || departments.length === 0) {
    return next(new AppError('Please provide an array of departments', 400));
  }
  
  // Add createdBy to all departments if user is authenticated
  if (req.user) {
    departments.forEach(dept => {
      dept.createdBy = req.user.id;
    });
  }
  
  const createdDepartments = await Department.insertMany(departments, { ordered: false });
  
  res.status(201).json({
    status: 'success',
    results: createdDepartments.length,
    data: {
      departments: createdDepartments
    }
  });
});

module.exports = {
  getAllDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByLocation,
  getDepartmentStats,
  updateDepartmentBudget,
  addPosition,
  removePosition,
  getDepartmentsWithBudgetIssues,
  toggleDepartmentStatus,
  getActiveDepartments,
  bulkCreateDepartments
};