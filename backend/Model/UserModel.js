// models/UserModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    age: {
        type: Number,
        min: 0,
        max: 120
        // Removed required: true to make it optional
    },
    dob: {
        type: Date
        // Removed required: true to make it optional
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin', 'staff', 'pharmacist', 'lab_technician'],
        default: 'patient'
    },
    address: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        this.updatedAt = Date.now();
        return next();
    }

    try {
        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);