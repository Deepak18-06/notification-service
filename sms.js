const twilio = require('twilio');
require('dotenv').config();

async function sendSMS(to, body) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID; 
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    try {
        const message = await client.messages.create({
            body: body,
            to: to,
            from: process.env.TWILIO_SENDER_MOB_NO
        });

        console.log('SMS sent:', message.sid);
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}

module.exports = sendSMS;