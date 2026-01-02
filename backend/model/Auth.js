const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Email Verification OTP
    isEmailVerified: { type: Boolean, default: false },
    emailOTP: { type: String },
    emailOTPExpires: { type: Date },
    emailOTPAttempts: { type: Number, default: 0 },

    // Password Reset OTP
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpires: { type: Date },
    resetPasswordOTPAttempts: { type: Number, default: 0 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Rate limiting
    lastOTPSent: { type: Date },

    // Account Status
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date },
});

// Hash password before saving
User.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password for login
User.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
User.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id }, process.env.SECRET_KEY || "FurqanAhmad", { expiresIn: '30d' });
};

// Convert to JSON (exclude sensitive fields)
User.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.emailOTP;
    delete user.resetPasswordOTP;
    delete user.resetPasswordToken;
    delete user.emailOTPAttempts;
    delete user.resetPasswordOTPAttempts;
    return user;
};

module.exports = mongoose.model("ForeverUser", User);
