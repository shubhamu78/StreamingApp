const nodemailer = require('nodemailer');

const sendEmail = async options => {

    const trasnporter = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 25,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from: 'Gokart',
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await trasnporter.sendMail(mailOptions);
}

module.exports = sendEmail;