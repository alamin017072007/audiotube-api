~~~{"id":"69413","variant":"standard","title":"YouTube API Proxy using Express"}
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json()); // JSON input parse করার জন্য

// POST endpoint
app.post('/youtube', async (req, res) => {
    const { url, cookies } = req.body;

    if (!url || !cookies) {
        return res.status(400).json({ error: true, message: "Please provide 'url' and 'cookies' in JSON." });
    }

    // JSON cookies কে header string এ convert করা
    const cookieHeader = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cookie': cookieHeader,
                'Referer': 'https://www.youtube.com/',
            }
        });

        res.json({
            error: false,
            data: response.data
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: err.response ? err.response.data : err.message
        });
    }
});

