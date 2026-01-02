const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
    register,
    verifyEmailOTP,
    resendOTP,
    login,
    logout,
    refresh,
    getCurrentUser,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require('../controller/AuthController');
const { protect } = require('../middleware/protect');


const router = express.Router();

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

const otpLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: 'Too many OTP requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

// Validation rules
const registerValidation = [
   
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
   
];

const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const otpValidation = [
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .isNumeric()
        .withMessage('OTP must be a 6-digit number')
];

const resetPasswordValidation = [
    body('resetToken')
        .notEmpty()
        .withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

// Routes

// Registration & Verification
router.post('/register', authLimiter, registerValidation, register);
router.post('/verify-otp', authLimiter, otpValidation, verifyEmailOTP);
router.post('/resend-otp', otpLimiter, resendOTP);

// Login & Logout
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);

// Password Reset
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-reset-otp', authLimiter, otpValidation, verifyResetOTP);
router.post('/reset-password', authLimiter, resetPasswordValidation, resetPassword);

// Protected Routes
router.get('/me', protect, getCurrentUser);

module.exports = router;