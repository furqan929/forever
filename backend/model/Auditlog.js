const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstaUser',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'register',
      'login',
      'logout',
      'email_verified',
      'password_reset_requested',
      'password_reset_completed',
      'password_changed',
      'profile_updated',
      'account_deleted',
      'failed_login',
      'failed_otp_verification',
      'otp_resent',
      '2fa_enabled',
      '2fa_disabled'
    ]
  },
  details: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  success: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);