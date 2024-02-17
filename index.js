const express = require('express');
const Worker  = require('bull');
const Queue  = require('bull');
const bodyParser = require('body-parser');
const sendEmail = require('./email');
const sendSMS = require('./sms');

const app = express();
app.use(bodyParser.json());

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Creating separate queues for each channel
const pushQueue = new Queue('push', REDIS_URL);
const smsQueue = new Queue('sms', REDIS_URL);
const emailQueue = new Queue('email', REDIS_URL);

// Creating workers for each queue
const pushWorker = new Worker('push', async job => {
    console.log(`Push worker processing job ${job.id}`);
    // Worker logic for processing push notifications
    console.log(`Push worker completed processing job ${job.id}`);
    const { userId, message } = job.data;
    await sendPushNotification(userId, message);
});

const smsWorker = new Worker('sms', async job => {
    console.log(`SMS worker processing job ${job.id}`);
    const { userId, message } = job.data;
    await sendSms(userId, message);
});

const emailWorker = new Worker('email', async job => {
    console.log(`Email worker processing job ${job.id}`);
    const { userId, message } = job.data;
    await sendMail(userId, message);
});

// Error handling for workers
pushWorker.on('failed', (job, error) => {
    console.error(`Push job ${job.id} failed with error: ${error.message}`);
});

smsWorker.on('failed', (job, error) => {
    console.error(`SMS job ${job.id} failed with error: ${error.message}`);
});

emailWorker.on('failed', (job, error) => {
    console.error(`Email job ${job.id} failed with error: ${error.message}`);
});

app.post('/sendNotification', async (req, res) => {
    try {
        const { userId, message } = req.body;
        if (!userId || !message) {
            return res.status(400).send('Missing userId or message in the request body');
        }
        const userPreferences = await getUserPreferences(userId);
        if (!userPreferences || !userPreferences.channels || !Array.isArray(userPreferences.channels)) {
            return res.status(500).send('User preferences are missing or invalid');
        }
        
        // Enqueue notifications for each channel
        const enqueuePromises = userPreferences.channels.map(channel => {
            switch (channel) {
                case 'push':
                    return pushQueue.add({ userId, message });
                case 'sms':
                    return smsQueue.add({ userId, message });
                case 'email':
                    return emailQueue.add({ userId, message });
                default:
                    console.log(`Unsupported channel: ${channel}`);
                    return Promise.resolve(); // Resolve immediately for unsupported channels
            }
        });
        console.log(pushQueue);
        await Promise.all(enqueuePromises); // Waiting for all notifications to be enqueued
        console.log("enqueued successfully")
        res.status(200).send('Notifications enqueued successfully');
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).send('Internal server error');
    }
});

async function getUserPreferences(userId) {
    // Mock implementation
    return {
        channels: ['push', 'sms', 'email']
    };
}

async function sendPushNotification(userId, message) {
    // Code to send push notification
    console.log("Push notification sent");
}

async function sendSms(userId, message) {
    // Code to send SMS
    // await sendSMS('+91_user_mob_number', message)
    console.log("SMS sent");
}

async function sendMail(userId, message) {
    // Code to send email
    // await sendEmail("user@email.com", "Notification", message);
    console.log("Email sent");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
