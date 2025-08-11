// server/utils/notificationService.js
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;
if (BOT_TOKEN) {
  bot = new TelegramBot(BOT_TOKEN, { polling: false }); // polling false for server-send only
}

const sendTelegramNotification = async (chatId, message) => {
  if (!bot) return console.error('Telegram bot token not configured');
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    console.log(`Telegram message sent to ${chatId}`);
    return true;
  } catch (err) {
    console.error('Telegram send error:', err.response?.body || err.message || err);
    return false;
  }
};

const sendOrderEmail = async (recipientEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Grocy App" <${process.env.SENDER_EMAIL}>`,
      to: recipientEmail,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${recipientEmail}`);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
};

module.exports = { sendTelegramNotification, sendOrderEmail };