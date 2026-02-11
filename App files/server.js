require('dotenv').config(); //access .env file

const { Translate } = require('@google-cloud/translate'); // google translate api client library, instead of http link
const translate = new Translate({ key: process.env.apiKey }); // create translate client with api key from .env file

const express = require('express'); // web framework for node.js, better for handling requests
const cors = require('cors'); // allows cross-origin requests, needed for frontend to access backend
const axios = require('axios'); // for making http requests to google translate api

const app = express(); // create express app
app.use(express.json()); // breaks down json requests, allows access to req.body
app.use(cors()); // enable CORS for all routes

const key = process.env.apiKey;
if (!key) {
    console.error('API key not found in .env file.');
    process.exit(1);
}

app.post('/translate', async (req, res) => { // post = send data to server, async = wait for response from google translate api before sending response to client
    try {
        const { text, sourceLanguage, targetLanguage } = req.body;

        if (!text || !sourceLanguage || !targetLanguage) {
            return res.status(400).json({ error: 'Missing required fields' }); // 400 error means bad request
        }

        const [translation] = await translate.translate(text, targetLanguage); // translate text using google translate api

        res.json({ translation }); // sends google response back to frontend
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
});

app.get('/test', (req, res) => { // test route to check if server is running
    res.send('Server is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { // starts server
    console.log(`Translation server running on http://localhost:${PORT}`);
app});