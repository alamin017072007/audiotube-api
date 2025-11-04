const express = require('express');
const https = require('https'); // YouTube HTTPS
const http = require('http');   // যদি HTTP লাগে
const app = express();

app.use(express.json());

app.post('/youtube', (req, res) => {
    const { url, cookies } = req.body;

    if (!url || !cookies) {
        return res.status(400).json({ error: true, message: "Please provide 'url' and 'cookies' in JSON." });
    }

    const cookieHeader = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

    const parsedUrl = new URL(url);
    const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': cookieHeader,
            'Referer': 'https://www.youtube.com/',
        }
    };

    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    const request = protocol.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
            res.json({
                error: false,
                data: data
            });
        });
    });

    request.on('error', (err) => {
        res.status(500).json({ error: true, message: err.message });
    });

    request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
