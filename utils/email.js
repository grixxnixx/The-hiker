const nodemailer = require('nodemailer');

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '3110b4f6b82c21',
      pass: 'b4563c3e5836d3'
    }
  });

  const mailOptions = {
    from: 'thvtaek@io.com',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // await transporter.s(mailOptions);
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
