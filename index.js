require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ===== ENV CHECK =====
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!TELEGRAM_BOT_TOKEN || !GEMINI_API_KEY) {
  console.error("Missing ENV variables");
  process.exit(1);
}

// ===== GEMINI SETUP =====
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

// ===== TELEGRAM BOT =====
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
  polling: true
});

console.log("🚀 Bot started successfully");

// ===== COMMANDS =====
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 Welcome!\n\nI am your AI Assistant powered by Gemini.\n\nType anything to chat."
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🛠 Available Commands:\n\n/start - Start the bot\n/help - Show help\n\nOr just type any message to chat with AI."
  );
});

// ===== MESSAGE HANDLER =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userText = msg.text;

  if (!userText || userText.startsWith("/")) return;

  try {
    console.log("User:", userText);

    const result = await model.generateContent(userText);
    const response = await result.response;
    const text = response.text();

    await bot.sendMessage(chatId, text);

  } catch (error) {
    console.error("Gemini Error:", error.message);
    await bot.sendMessage(chatId, "⚠️ AI error aa gaya. Please try again.");
  }
});

// ===== RENDER SERVER =====
app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
