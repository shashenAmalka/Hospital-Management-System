const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        match: [/^[+]?[0-9]{10,15}$/, 'Please use a valid phone number.']
    },
    mobileNumber: {
        type: String,
        match: [/^[+]?[0-9]{10,15}$/, 'Please use a valid mobile number.']
    },
    age: {
        type: Number,
        min: 0,
        max: 120
    },
    dob: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    address: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin', 'lab_technician', 'pharmacist', 'staff'],
        default: 'patient'
    }
}, { timestamps: true });

// Hash password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare entered password with the hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Exports the User model, creating it if it doesn't already exist
module.exports = mongoose.models.User || mongoose.model("User", userSchema);

