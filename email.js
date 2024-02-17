const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(to, subject, text) {
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    
    let emailOptions = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        text: text
    };

    try {
        let info = await transporter.sendMail(emailOptions);
        console.log("Email Sent" + info.response);
    } catch (error) {
        console.error("Error sending email: ", error);
        throw error;
    }
}

module.exports = sendEmail;
