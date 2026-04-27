const transporter = require('../config/mailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"SplitKar" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

module.exports = sendEmail;
