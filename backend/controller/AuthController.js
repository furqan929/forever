const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../model/Auth');
const RefreshToken = require('../model/RefreshToken');
const emailService = require('../utils/emailService');
const { logAudit } = require('../utils/auditLogger');
const {
    generateOTP,
    hashOTP,
    verifyOTP,
    isOTPExpired,
    getOTPExpiration,
    canRequestNewOTP,
    getRemainingCooldown
} = require('../utils/otpGenerator');

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.SECRET_KEY || 'FurqanAhmad', { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.SECRET_KEY || 'FurqanAhmad', { expiresIn: '7d' });
};

// REGISTER - Step 1: Create user and send OTP
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            emailOTP: hashedOTP,
            emailOTPExpires: getOTPExpiration(),
            emailOTPAttempts: 0,
            lastOTPSent: new Date(),
            isEmailVerified: false
        });

        await user.save();

        try {
            await logAudit({
                userId: user._id,
                action: 'register',
                details: `User registered with email: ${user.email}`,
                req,
                success: true
            });
        } catch (auditError) {
            console.error('Audit log error:', auditError);
        }

        try {
            await emailService.sendVerificationOTP(user, otp);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification code.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// VERIFY EMAIL OTP - Step 2: Verify OTP and complete registration
const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        if (!user.emailOTP) {
            return res.status(400).json({
                success: false,
                message: 'No verification code found. Please request a new one.'
            });
        }

        if (isOTPExpired(user.emailOTPExpires)) {
            return res.status(400).json({
                success: false,
                message: 'Verification code expired. Please request a new one.'
            });
        }

        if (user.emailOTPAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Too many failed attempts. Please request a new code.'
            });
        }

        if (!verifyOTP(otp, user.emailOTP)) {
            user.emailOTPAttempts += 1;
            await user.save();

            try {
                await logAudit({
                    userId: user._id,
                    action: 'failed_otp_verification',
                    details: `Failed email OTP verification attempt ${user.emailOTPAttempts}/5`,
                    req,
                    success: false
                });
            } catch (auditError) {
                console.error('Audit log error:', auditError);
            }

            return res.status(400).json({
                success: false,
                message: 'Invalid verification code',
                attemptsRemaining: 5 - user.emailOTPAttempts
            });
        }

        user.isEmailVerified = true;
        user.emailOTP = undefined;
        user.emailOTPExpires = undefined;
        user.emailOTPAttempts = 0;
        const token = user.generateAuthToken();
        await user.save();

        try {
            await logAudit({
                userId: user._id,
                action: 'email_verified',
                details: 'Email successfully verified',
                req,
                success: true
            });
        } catch (auditError) {
            console.error('Audit log error:', auditError);
        }

        try {
            await emailService.sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Email verified successfully',
            user: {
                ...user.toJSON(),
                token
            },
            accessToken
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification'
        });
    }
};

// RESEND OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        if (!canRequestNewOTP(user.lastOTPSent, 1)) {
            const remaining = getRemainingCooldown(user.lastOTPSent, 1);
            return res.status(429).json({
                success: false,
                message: `Please wait ${remaining} seconds before requesting a new code`,
                remainingSeconds: remaining
            });
        }

        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        user.emailOTP = hashedOTP;
        user.emailOTPExpires = getOTPExpiration();
        user.emailOTPAttempts = 0;
        user.lastOTPSent = new Date();
        await user.save();

        try {
            await logAudit({
                userId: user._id,
                action: 'otp_resent',
                details: 'Email verification OTP resent',
                req,
                success: true
            });
        } catch (auditError) {
            console.error('Audit log error:', auditError);
        }

        try {
            await emailService.sendVerificationOTP(user, otp);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again later.'
            });
        }

        res.json({
            success: true,
            message: 'Verification code sent successfully'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resending code'
        });
    }
};

// LOGIN - Only for verified users
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
                requiresVerification: true,
                email: user.email
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            try {
                await logAudit({
                    userId: user._id,
                    action: 'failed_login',
                    details: 'Invalid password',
                    req,
                    success: false
                });
            } catch (auditError) {
                console.error('Audit log error:', auditError);
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = user.generateAuthToken();
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        await RefreshToken.create({
            token: refreshToken,
            user: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        user.lastSeen = new Date();
        await user.save();

        try {
            await logAudit({
                userId: user._id,
                action: 'login',
                details: 'User logged in successfully',
                req,
                success: true
            });
        } catch (auditError) {
            console.error('Audit log error:', auditError);
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                ...user.toJSON(),
                token
            },
            accessToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// FORGOT PASSWORD - Send OTP
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset code'
            });
        }

        if (!canRequestNewOTP(user.lastOTPSent, 1)) {
            const remaining = getRemainingCooldown(user.lastOTPSent, 1);
            return res.status(429).json({
                success: false,
                message: `Please wait ${remaining} seconds before requesting a new code`,
                remainingSeconds: remaining
            });
        }

        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);

        user.resetPasswordOTP = hashedOTP;
        user.resetPasswordOTPExpires = getOTPExpiration();
        user.resetPasswordOTPAttempts = 0;
        user.lastOTPSent = new Date();
        await user.save();

        try {
            await logAudit({
                userId: user._id,
                action: 'password_reset_requested',
                details: 'Password reset OTP requested',
                req,
                success: true
            });
        } catch (auditError) {
            console.error('Audit log error:', auditError);
        }

        try {
            await emailService.sendPasswordResetOTP(user, otp);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError);
        }

        res.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset code'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// VERIFY RESET OTP
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.resetPasswordOTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset code'
            });
        }

        if (isOTPExpired(user.resetPasswordOTPExpires)) {
            return res.status(400).json({
                success: false,
                message: 'Reset code expired. Please request a new one.'
            });
        }

        if (user.resetPasswordOTPAttempts >= 5) {
            return res.status(429).json({
                success: false,
                message: 'Too many failed attempts. Please request a new code.'
            });
        }

        if (!verifyOTP(otp, user.resetPasswordOTP)) {
            user.resetPasswordOTPAttempts += 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Invalid reset code',
                attemptsRemaining: 5 - user.resetPasswordOTPAttempts
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        res.json({
            success: true,
            message: 'OTP verified successfully',
            resetToken
        });

    } catch (error) {
        console.error('Verify reset OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        const { resetToken, password } = req.body;

        if (!resetToken || !password) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        user.resetPasswordOTPAttempts = 0;
        await user.save();

        await RefreshToken.deleteMany({ user: user._id });

        try {
            await logAudit({
                userId: user._id,
                action: 'password_reset_completed',
                details: 'Password successfully reset',
                req,
                success: true
            });
        } catch (auditError) {
            console.error('Audit log error:', auditError);
        }

        res.json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// LOGOUT
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (refreshToken) {
            await RefreshToken.deleteMany({ token: refreshToken });
        }

        if (req.user) {
            try {
                await logAudit({
                    userId: req.user._id,
                    action: 'logout',
                    details: 'User logged out',
                    req,
                    success: true
                });
            } catch (auditError) {
                console.error('Audit log error:', auditError);
            }
        }

        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout' });
    }
};

// REFRESH TOKEN
const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token provided' });
        }

        const stored = await RefreshToken.findOne({ token });
        if (!stored) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.SECRET_KEY || 'FurqanAhmad');
        } catch (err) {
            await RefreshToken.deleteMany({ token });
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken(payload.userId);
        res.json({ success: true, accessToken });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET CURRENT USER
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
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
};
