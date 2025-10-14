// models/UserModel.js
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
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

// Hash password before saving if modified
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Hash password on findOneAndUpdate if provided
userSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        if (!update) return next();

        // Handle direct set and $set cases
        const pwd = update.password || (update.$set && update.$set.password);
        if (pwd) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(pwd, salt);
            if (update.$set && update.$set.password) {
                update.$set.password = hashed;
            } else {
                update.password = hashed;
            }
            this.setUpdate(update);
        }
        next();
    } catch (err) {
        next(err);
    }
});

// Hash password before saving if modified
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Hash password on findOneAndUpdate if provided
userSchema.pre('findOneAndUpdate', async function(next) {
    try {
        const update = this.getUpdate();
        if (!update) return next();

        // Handle direct set and $set cases
        const pwd = update.password || (update.$set && update.$set.password);
        if (pwd) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(pwd, salt);
            if (update.$set && update.$set.password) {
                update.$set.password = hashed;
            } else {
                update.password = hashed;
            }
            this.setUpdate(update);
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("User", userSchema);