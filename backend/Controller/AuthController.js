// controllers/AuthController.js
const User = require('../Model/UserModel');
const Staff = require('../Model/StaffModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, age, dob, gender, mobileNumber, address } = req.body;

    // Combine firstName and lastName into name
    const name = `${firstName} ${lastName}`.trim();

    // Debug logging
    console.log('Registration attempt:', { firstName, lastName, name, email, age, dob, gender, mobileNumber, address });

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !mobileNumber) {
      return res.status(400).json({ 
        message: 'Required fields: firstName, lastName, email, password, mobileNumber' 
      });
    }

    // Validate optional fields if provided
    if (age && (age < 0 || age > 120)) {
      return res.status(400).json({ 
        message: 'Age must be between 0 and 120' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if mobile number already exists
    const existingMobile = await User.findOne({ mobileNumber });
    if (existingMobile) {
      return res.status(400).json({ message: 'User already exists with this mobile number' });
    }

    // Note: Password will be hashed by the UserModel pre-save hook
    // No need to hash here to prevent double hashing

    // Prepare user data
    const userData = {
      name,
      email,
      password, // Raw password - will be hashed by model
      gender: gender || 'male', // Default gender if not provided
      mobileNumber,
      role: 'patient' // Default role
    };

    // Add address if provided
    if (address && address.trim()) {
      userData.address = address.trim();
    }

    // Add age if provided
    if (age) {
      userData.age = parseInt(age);
    }

    // Add dob if provided
    if (dob) {
      userData.dob = new Date(dob);
      
      // Auto-calculate age from dob if age not provided
      if (!age) {
        const birthDate = new Date(dob);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        
        userData.age = calculatedAge;
      }
    }

    // Age and dob are now optional - users can register without them

    // Create new user
    const user = new User(userData);
    await user.save();
    
    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback_secret_key', // Fallback for development
      { expiresIn: '24h' }
    );

    // Success response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        dob: user.dob,
        gender: user.gender,
        mobileNumber: user.mobileNumber,
        address: user.address,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate field value entered' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug logging
    console.log('🔐 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // First, check if user is a staff member
    let user = await Staff.findOne({ email }).select('+password');
    let isStaff = false;
    
    if (user) {
      isStaff = true;
      // Check if staff is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      // Check password for staff
      const isMatch = await user.correctPassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login for staff
      user.lastLogin = new Date();
      await user.save();

    } else {
      // If not found in Staff, check User collection (for patients and admins)
      user = await User.findOne({ email });
      
      if (!user) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('✅ User found:', email, '| Password hash length:', user.password?.length);

      // Check password for user (handle legacy plaintext passwords)
      let isMatch = false;
      try {
        // Try bcrypt compare first
        console.log('🔑 Attempting bcrypt compare...');
        isMatch = await bcrypt.compare(password, user.password);
        console.log('🔑 Bcrypt compare result:', isMatch);
      } catch (e) {
        // If stored password is not a valid bcrypt hash, compare plaintext
        console.log('⚠️ Bcrypt compare failed, trying plaintext:', e.message);
        isMatch = user.password === password;
      }

      // If password matches but was stored in plaintext, migrate to hashed
      const looksHashed = typeof user.password === 'string' && user.password.startsWith('$2') && user.password.length >= 50;
      if (!looksHashed && user.password === password) {
        try {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
          isMatch = true;
          console.log(`Password migrated to hashed for user ${user.email}`);
        } catch (migrateErr) {
          console.error('Password migration failed:', migrateErr);
        }
      }

      if (!isMatch) {
        console.log('❌ Password mismatch for user:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log('✅ Password matched for user:', email);
    }

    // Password validation completed above - proceed to token generation
    console.log('🎫 Generating JWT token for:', email);

    // Verify JWT_SECRET exists or use fallback
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';

    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        name: user.name,
        email: user.email
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        dob: user.dob,
        gender: user.gender,
        mobileNumber: user.mobileNumber,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login', 
      error: error.message 
    });
  }
};

// Optional: Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional: Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, age, dob, gender, mobileNumber, address } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, age, dob, gender, mobileNumber, address, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Staff Registration Function
const registerStaff = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      department, 
      role,
      specialization,
      address,
      emergencyContact 
    } = req.body;

    // Debug logging
    console.log('Staff registration attempt:', { firstName, lastName, email, department, role });

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !department || !role) {
      return res.status(400).json({ 
        message: 'Required fields: firstName, lastName, email, password, phone, department, role' 
      });
    }

    // Check if staff already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff member already exists with this email' });
    }

    // Also check in User collection to prevent email conflicts
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists in the system' });
    }

    // Prepare staff data
    const staffData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      department,
      role,
      status: 'active'
    };

    // Add specialization if provided (for doctors)
    if (specialization && role === 'doctor') {
      staffData.specialization = specialization;
    }

    // Add address if provided
    if (address) {
      staffData.address = address;
    }

    // Add emergency contact if provided
    if (emergencyContact) {
      staffData.emergencyContact = emergencyContact;
    }

    // Create new staff member
    const staff = new Staff(staffData);
    await staff.save();
    
    // Map staff role to user role for consistency
    let mappedRole;
    switch (staff.role) {
      case 'doctor':
      case 'physician':
        mappedRole = 'doctor';
        break;
      case 'pharmacist':
        mappedRole = 'pharmacist';
        break;
      case 'lab-technician':
      case 'technician':
        mappedRole = 'lab_technician';
        break;
      case 'nurse':
        mappedRole = 'staff';
        break;
      case 'administrator':
      case 'department-head':
        mappedRole = 'admin';
        break;
      default:
        mappedRole = 'staff';
    }

    // Create token
    const token = jwt.sign(
      { 
        id: staff._id, 
        role: mappedRole,
        name: staff.fullName,
        email: staff.email
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    // Success response
    res.status(201).json({
      message: 'Staff member registered successfully',
      token,
      user: {
        id: staff._id,
        name: staff.fullName,
        email: staff.email,
        role: mappedRole,
        department: staff.department,
        specialization: staff.specialization,
        employeeId: staff.employeeId,
        phone: staff.phone
      }
    });

  } catch (error) {
    console.error('Staff registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during staff registration', 
      error: error.message 
    });
  }
};

// Test function for staff registration and login functionality
const testStaffAuth = async (req, res) => {
  try {
    const results = [];
    
    // Test 1: Register a staff member (doctor)
    const staffData = {
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'dr.john.smith@hospital.com',
      password: 'password123',
      phone: '+1234567890',
      department: 'cardiology',
      role: 'doctor',
      specialization: 'cardiology'
    };

    try {
      // Check if staff already exists
      const existingStaff = await Staff.findOne({ email: staffData.email });
      if (existingStaff) {
        results.push({
          test: 'Staff Registration (Doctor)',
          status: 'skipped',
          message: 'Staff member already exists',
          data: {
            name: existingStaff.fullName,
            email: existingStaff.email,
            role: existingStaff.role,
            employeeId: existingStaff.employeeId
          }
        });
      } else {
        // Create new staff member
        const staff = new Staff(staffData);
        await staff.save();
        
        results.push({
          test: 'Staff Registration (Doctor)',
          status: 'success',
          message: 'Staff member registered successfully',
          data: {
            name: staff.fullName,
            email: staff.email,
            role: staff.role,
            employeeId: staff.employeeId,
            department: staff.department
          }
        });
      }
    } catch (error) {
      results.push({
        test: 'Staff Registration (Doctor)',
        status: 'failed',
        message: error.message
      });
    }

    // Test 2: Staff Login Test
    try {
      const user = await Staff.findOne({ email: staffData.email }).select('+password');
      if (user && await user.correctPassword(staffData.password, user.password)) {
        // Map role
        let mappedRole = user.role === 'doctor' ? 'doctor' : 'staff';
        
        results.push({
          test: 'Staff Login (Doctor)',
          status: 'success',
          message: 'Staff login successful',
          data: {
            name: user.fullName,
            email: user.email,
            role: mappedRole,
            employeeId: user.employeeId
          }
        });
      } else {
        results.push({
          test: 'Staff Login (Doctor)',
          status: 'failed',
          message: 'Invalid credentials or user not found'
        });
      }
    } catch (error) {
      results.push({
        test: 'Staff Login (Doctor)',
        status: 'failed',
        message: error.message
      });
    }

    // Test 3: Register pharmacist
    const pharmacistData = {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@hospital.com',
      password: 'pharmacy123',
      phone: '+1987654321',
      department: 'pharmacy',
      role: 'pharmacist'
    };

    try {
      const existingPharmacist = await Staff.findOne({ email: pharmacistData.email });
      if (existingPharmacist) {
        results.push({
          test: 'Staff Registration (Pharmacist)',
          status: 'skipped',
          message: 'Pharmacist already exists',
          data: {
            name: existingPharmacist.fullName,
            email: existingPharmacist.email,
            role: existingPharmacist.role
          }
        });
      } else {
        const pharmacist = new Staff(pharmacistData);
        await pharmacist.save();
        
        results.push({
          test: 'Staff Registration (Pharmacist)',
          status: 'success',
          message: 'Pharmacist registered successfully',
          data: {
            name: pharmacist.fullName,
            email: pharmacist.email,
            role: pharmacist.role,
            employeeId: pharmacist.employeeId
          }
        });
      }
    } catch (error) {
      results.push({
        test: 'Staff Registration (Pharmacist)',
        status: 'failed',
        message: error.message
      });
    }

    // Test 4: Patient Registration and Login Test
    const patientData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'patient123',
      mobileNumber: '+1122334455',
      gender: 'female',
      age: 30
    };

    try {
      const existingPatient = await User.findOne({ email: patientData.email });
      if (existingPatient) {
        results.push({
          test: 'Patient Registration',
          status: 'skipped',
          message: 'Patient already exists',
          data: {
            name: existingPatient.name,
            email: existingPatient.email,
            role: existingPatient.role
          }
        });
      } else {
        const patient = new User({
          name: `${patientData.firstName} ${patientData.lastName}`,
          email: patientData.email,
          password: patientData.password, // Will be hashed by pre-save
          gender: patientData.gender,
          mobileNumber: patientData.mobileNumber,
          age: patientData.age,
          role: 'patient'
        });
        
        await patient.save();
        
        results.push({
          test: 'Patient Registration',
          status: 'success',
          message: 'Patient registered successfully',
          data: {
            name: patient.name,
            email: patient.email,
            role: patient.role
          }
        });
      }

      // Test patient login
      const patient = await User.findOne({ email: patientData.email });
      if (patient && await bcrypt.compare(patientData.password, patient.password)) {
        results.push({
          test: 'Patient Login',
          status: 'success',
          message: 'Patient login successful',
          data: {
            name: patient.name,
            email: patient.email,
            role: patient.role
          }
        });
      } else {
        results.push({
          test: 'Patient Login',
          status: 'failed',
          message: 'Patient login failed'
        });
      }
    } catch (error) {
      results.push({
        test: 'Patient Registration/Login',
        status: 'failed',
        message: error.message
      });
    }

    // Return test results
    res.json({
      message: 'Authentication system tests completed',
      summary: {
        total: results.length,
        passed: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: results.filter(r => r.status === 'skipped').length
      },
      results: results,
      conclusion: 'Staff members can now register and login directly without manual role changes!'
    });

  } catch (error) {
    console.error('Test function error:', error);
    res.status(500).json({
      message: 'Test function failed',
      error: error.message
    });
  }
};

// Validate token endpoint - used to check if user's token is still valid
const validateToken = async (req, res) => {
  try {
    // If we reach here, the token is valid (verified by middleware)
    // Return user info from the token
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      isAuthenticated: true
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating token',
      error: error.message
    });
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  validateToken 
};