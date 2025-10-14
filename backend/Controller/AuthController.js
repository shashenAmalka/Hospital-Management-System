// controllers/AuthController.js
const User = require('../Model/UserModel');
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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
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
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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

// Validate token and return user info
const validateToken = async (req, res) => {
  try {
    // Token is already validated by authMiddleware
    // req.user contains the decoded token data
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        valid: false, 
        message: 'User not found' 
      });
    }

    res.json({
      valid: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        dob: user.dob,
        gender: user.gender,
        mobileNumber: user.mobileNumber,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Server error during token validation' 
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