const User = require('../Model/UserModel');
const Patient = require('../Model/PatientModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    // Extract data - handle both "name" and "firstName/lastName" patterns
    const { firstName, lastName, name, email, password, age, dob, gender, mobileNumber } = req.body;
    
    let userFirstName, userLastName;
    
    // Handle case where name is sent instead of firstName/lastName
    if (name && (!firstName && !lastName)) {
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      userFirstName = nameParts[0] || '';
      userLastName = nameParts.slice(1).join(' ') || '';
    } else {
      userFirstName = firstName || '';
      userLastName = lastName || '';
    }

    // Validate required fields
    if (!email || !password || !mobileNumber) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ 
        message: 'Required fields: email, password, mobileNumber' 
      });
    } 

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate username from email if not provided
    const username = email.split('@')[0] + '_' + Date.now();

    // Create new user
    const user = new User({
      username,
      firstName: userFirstName,
      lastName: userLastName,
      email,
      password, // This will be hashed by the pre-save hook
      mobileNumber,
      age: age ? parseInt(age) : undefined,
      dob: dob ? new Date(dob) : undefined,
      gender,
      role: 'patient' // Default role
    });

    console.log('Creating user with data:', {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    });

    await user.save();
    console.log('User created successfully with ID:', user._id);
    
    // Create patient record
    try {
      const patient = new Patient({
        userId: user._id,
        dateOfBirth: dob ? new Date(dob) : undefined,
        gender,
        phoneNumber: mobileNumber
      });
      
      await patient.save();
      console.log('Patient record created with ID:', patient._id);
    } catch (patientError) {
      console.warn('Failed to create patient record:', patientError.message);
      // Continue with registration even if patient record creation fails
    }
    
    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );

    // Success response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
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
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
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
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Export controllers
module.exports = {
  register,
  login
};