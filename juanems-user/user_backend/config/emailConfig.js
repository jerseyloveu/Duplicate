// emailConfig.js
module.exports = {
    service: 'brevo',
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: '8acb69001@smtp-brevo.com',
        pass: '4J7IyLYxKfD60QZA'
    },
    sender: 'juanems.sjdefi@gmail.com',
    otpExpiry: 3 * 60 * 1000, // 3 minutes in milliseconds
    accountVerificationExpiry: 5 * 24 * 60 * 60 * 1000 // 5 days in milliseconds
};