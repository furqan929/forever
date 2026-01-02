const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Email templates
const getEmailTemplate = (type, data) => {
    const baseStyle = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
      .logo { font-size: 32px; font-weight: bold; color: #ffffff; margin: 0; }
      .content { padding: 40px 30px; }
      .otp-box { background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
      .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; }
      .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
      .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; color: #856404; }
      h1 { color: #212529; font-size: 24px; margin: 0 0 20px 0; }
      p { color: #495057; line-height: 1.6; margin: 15px 0; }
      .divider { border-top: 1px solid #e9ecef; margin: 30px 0; }
    </style>
  `;

    const templates = {
        verifyEmail: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyle}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">🛍️ ${process.env.STORE_NAME || 'Forever'}</h1>
          </div>
          <div class="content">
            <h1>Verify Your Email Address</h1>
            <p>Hi ${data.username || 'there'},</p>
            <p>Welcome to ${process.env.STORE_NAME || 'Forever'}! To complete your registration, please verify your email address using the code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #6c757d; font-size: 14px;">Your verification code</p>
              <div class="otp-code">${data.otp}</div>
              <p style="margin: 0; color: #6c757d; font-size: 12px;">This code expires in 10 minutes</p>
            </div>
            
            <p>If you didn't create an account with ${process.env.STORE_NAME || 'Forever'}, you can safely ignore this email.</p>
            
            <div class="warning">
              <strong>⚠ Security Notice:</strong> Never share this code with anyone. ${process.env.STORE_NAME || 'Forever'} will never ask for your verification code.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.STORE_NAME || 'Forever'}. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,

        resetPassword: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyle}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">🛍️ ${process.env.STORE_NAME || 'Forever'}</h1>
          </div>
          <div class="content">
            <h1>Reset Your Password</h1>
            <p>Hi ${data.username || 'there'},</p>
            <p>We received a request to reset your password. Use the code below to proceed:</p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #6c757d; font-size: 14px;">Your password reset code</p>
              <div class="otp-code">${data.otp}</div>
              <p style="margin: 0; color: #6c757d; font-size: 12px;">This code expires in 10 minutes</p>
            </div>
            
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <div class="warning">
              <strong>⚠ Security Notice:</strong> Never share this code with anyone. ${process.env.STORE_NAME || 'Forever'} will never ask for your reset code.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.STORE_NAME || 'Forever'}. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,

        welcomeEmail: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyle}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">🛍️ ${process.env.STORE_NAME || 'Forever'}</h1>
          </div>
          <div class="content">
            <h1>Welcome to ${process.env.STORE_NAME || 'Forever'}! 🎉</h1>
            <p>Hi ${data.username},</p>
            <p>Your email has been successfully verified! You're all set to start shopping with us.</p>
            
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #667eea;">Get Started:</h3>
              <ul style="color: #495057; line-height: 2;">
                <li>Browse our products</li>
                <li>Add items to your wishlist</li>
                <li>Enjoy exclusive deals</li>
                <li>Track your orders</li>
              </ul>
            </div>
            
            <a href="${data.loginUrl || process.env.FRONTEND_URL}" class="button">Start Shopping</a>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #6c757d;">Need help? Contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.STORE_NAME || 'Forever'}. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
    };

    return templates[type] || '';
};

// Send email function
const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.STORE_NAME || 'Forever'}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send email');
    }
};

// Send verification OTP
const sendVerificationOTP = async (user, otp) => {
    const html = getEmailTemplate('verifyEmail', {
        username: user.name,
        otp
    });

    return await sendEmail({
        to: user.email,
        subject: `Verify Your Email - ${process.env.STORE_NAME || 'Forever'}`,
        html
    });
};

// Send password reset OTP
const sendPasswordResetOTP = async (user, otp) => {
    const html = getEmailTemplate('resetPassword', {
        username: user.name,
        otp
    });

    return await sendEmail({
        to: user.email,
        subject: `Reset Your Password - ${process.env.STORE_NAME || 'Forever'}`,
        html
    });
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
    const html = getEmailTemplate('welcomeEmail', {
        username: user.name,
        loginUrl: `${process.env.FRONTEND_URL}/login`
    });

    return await sendEmail({
        to: user.email,
        subject: `Welcome to ${process.env.STORE_NAME || 'Forever'}! 🎉`,
        html
    });
};

module.exports = {
    sendEmail,
    sendVerificationOTP,
    sendPasswordResetOTP,
    sendWelcomeEmail
};