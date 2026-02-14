require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ===== ENV VARIABLES =====
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!TELEGRAM_BOT_TOKEN || !GEMINI_API_KEY) {
  console.error("Missing ENV variables");
  process.exit(1);
}

// ===== GEMINI SETUP =====
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"


});

// ===== TELEGRAM BOT =====
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

console.log("Bot started successfully");

// ===== MESSAGE HANDLER =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  try {
    const result = await model.generateContent(text);
    const response = result.response;
    const reply = response.text();

    await bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error("Gemini Error:", err.message);
    await bot.sendMessage(chatId, "⚠️ AI error aa raha hai.");
  }
});

// ===== RENDER SERVER =====
app.get("/", (req, res) => {
  res.send("Bot running 🚀");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
