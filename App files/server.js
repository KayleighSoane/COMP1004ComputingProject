require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Translate } = require('@google-cloud/translate').v2;

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Translate with API key from .env
const translate = new Translate({
  key: process.env.APIkey
});

// Translate endpoint
app.post('/translate', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [translatedText] = await translate.translate(text, {
      from: sourceLanguage,
      to: targetLanguage
    });

    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Translation server running on http://localhost:${PORT}`);
});
