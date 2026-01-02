const AuditLog = require('../model/Auditlog');

/**
 * Log an audit event
 * @param {Object} params - Audit log parameters
 * @param {String} params.userId - User ID
 * @param {String} params.action - Action performed
 * @param {String} params.details - Additional details
 * @param {Object} params.req - Express request object (optional)
 * @param {Boolean} params.success - Whether action was successful
 * @param {Object} params.metadata - Additional metadata
 */
const logAudit = async ({
  userId,
  action,
  details = '',
  req = null,
  success = true,
  metadata = {}
}) => {
  try {
    const auditData = {
      user: userId,
      action,
      details,
      success,
      metadata
    };

    // Extract IP and user agent from request if provided
    if (req) {
      auditData.ipAddress = req.ip || req.connection.remoteAddress;
      auditData.userAgent = req.get('user-agent');
    }

    await AuditLog.create(auditData);
  } catch (error) {
    // Don't throw error - audit logging should not break the main flow
    console.error('Audit logging failed:', error);
  }
};

/**
 * Get audit logs for a user
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 */
const getUserAuditLogs = async (userId, options = {}) => {
  const {
    limit = 50,
    skip = 0,
    action = null,
    startDate = null,
    endDate = null
  } = options;

  const query = { user: userId };

  if (action) {
    query.action = action;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return await AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

/**
 * Get recent failed login attempts
 * @param {String} userId - User ID
 * @param {Number} minutes - Time window in minutes
 */
const getRecentFailedLogins = async (userId, minutes = 15) => {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  
  return await AuditLog.countDocuments({
    user: userId,
    action: 'failed_login',
    success: false,
    createdAt: { $gte: since }
  });
};

/**
 * Clean up old audit logs
 * @param {Number} days - Keep logs for this many days
 */
const cleanupOldLogs = async (days = 90) => {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await AuditLog.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  console.log(`Cleaned up ${result.deletedCount} old audit logs`);
  return result.deletedCount;
};

module.exports = {
  logAudit,
  getUserAuditLogs,
  getRecentFailedLogins,
  cleanupOldLogs
};