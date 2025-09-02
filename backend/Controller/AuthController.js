// controllers/AuthController.js
const User = require('../Model/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password, age, dob, gender, mobileNumber } = req.body;

    // Debug logging
    console.log('Registration attempt:', { name, email, age, dob, gender, mobileNumber });

    // Validate required fields
    if (!name || !email || !password || !age || !dob || !gender || !mobileNumber) {
      return res.status(400).json({ 
        message: 'All fields are required: name, email, password, age, dob, gender, mobileNumber' 
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

    // Create new user with all required fields
    const user = new User({
      name,
      email,
      password: hashedPassword,
      age: parseInt(age),
      dob: new Date(dob),
      gender,
      mobileNumber,
      role: 'patient' // Default role
    });

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

module.exports = { 
  register, 
  login, 
  getProfile, 
  updateProfile 
};