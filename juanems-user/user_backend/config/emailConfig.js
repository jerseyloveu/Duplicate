// emailConfig.js
module.exports = {
    service: 'brevo',
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: '8acb69001@smtp-brevo.com',
        pass: '4J7IyLYxKfD60QZA'
    },
    sender: 'juanems.sjdefi@gmail.com',
    senderName: 'JuanEMS SJDEFI', // Added sender name
    otpExpiry: 3 * 60 * 1000, // 3 minutes
    accountVerificationExpiry: 5 * 24 * 60 * 60 * 1000, // 5 days
    supportEmail: 'juanems.sjdefi@gmail.com', // Add support email
    systemName: 'Juan Enrollment Management System (JuanEMS)' // System name for consistent branding
};