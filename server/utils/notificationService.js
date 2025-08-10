require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

const sendTelegramNotification = async (chatId, message) => {
    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
        console.log(`✅ Telegram message sent to ${chatId}`);
    } catch (err) {
        console.error(`❌ Failed to send Telegram message:`, err.message);
    }
};

module.exports = { sendTelegramNotification };const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');

const sendOrderEmail = async (recipientEmail, subject, htmlContent) => { /* ... */ };

const sendTelegramNotification = async (chatId, message) => {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set in .env file.');
            return;
        }
        
        console.log(`Attempting to send Telegram message to Chat ID: ${chatId}`);
        const bot = new TelegramBot(botToken);
        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
        console.log(`✅ Telegram notification sent successfully to Chat ID ${chatId}`);

    } catch (error) {
        console.error(`❌ FAILED to send Telegram message to ${chatId}.`);
        if (error.response && error.response.body) {
            console.error('Telegram API Error:', error.response.body.description);
        } else {
            console.error('General Telegram Error:', error.message);
        }
    }
};

module.exports = { sendOrderEmail, sendTelegramNotification };
