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

module.exports = { sendTelegramNotification };