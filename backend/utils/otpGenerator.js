const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP for secure storage
 * @param {string} otp - The OTP to hash
 * @returns {string} Hashed OTP
 */
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP against hashed version
 * @param {string} otp - The OTP to verify
 * @param {string} hashedOTP - The hashed OTP to compare against
 * @returns {boolean} True if OTP matches
 */
const verifyOTP = (otp, hashedOTP) => {
    const hash = hashOTP(otp);
    return hash === hashedOTP;
};

/**
 * Check if OTP is expired
 * @param {Date} expiresAt - The expiration date
 * @returns {boolean} True if expired
 */
const isOTPExpired = (expiresAt) => {
    return !expiresAt || new Date() > new Date(expiresAt);
};

/**
 * Get OTP expiration time (10 minutes from now)
 * @returns {Date} Expiration date
 */
const getOTPExpiration = () => {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Check if user can request new OTP (cooldown period)
 * @param {Date} lastSent - Last OTP sent time
 * @param {number} cooldownMinutes - Cooldown period in minutes (default: 1)
 * @returns {boolean} True if can request new OTP
 */
const canRequestNewOTP = (lastSent, cooldownMinutes = 1) => {
    if (!lastSent) return true;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    return Date.now() - new Date(lastSent).getTime() >= cooldownMs;
};

/**
 * Get remaining cooldown time in seconds
 * @param {Date} lastSent - Last OTP sent time
 * @param {number} cooldownMinutes - Cooldown period in minutes (default: 1)
 * @returns {number} Remaining seconds
 */
const getRemainingCooldown = (lastSent, cooldownMinutes = 1) => {
    if (!lastSent) return 0;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const elapsed = Date.now() - new Date(lastSent).getTime();
    const remaining = cooldownMs - elapsed;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP,
    isOTPExpired,
    getOTPExpiration,
    canRequestNewOTP,
    getRemainingCooldown
};