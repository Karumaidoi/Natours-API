/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //2) Define email options
  const mailOptions = {
    from: `Password reset <${process.env.MAIL_GUN_SMTP}>`,
    to: ['mainahmwangi12@gmail.com', 'briankagwanja34@gmail.com'],
    subject: 'Password Reset Email (Valid for 10 Mins only)',
    text: options.message,
  };

  //3) Send the email with nodemailer
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
