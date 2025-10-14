// models/UserModel.js
const mongoose = require("mongoose");
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

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("User", userSchema);