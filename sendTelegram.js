require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const chatId = process.env.TELEGRAM_CHAT_ID;
const message = `<b>🛒 Test Message from Bot!</b>\n<b>Total:</b> ₹200`;

bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
  .then(() => console.log("✅ Message sent"))
  .catch((err) => console.error("❌ Error:", err.message));