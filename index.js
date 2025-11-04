const express = require('express');
const app = express();
app.use(express.json());

const http = require('http');
const server = http.createServer(app);

const ytdl = require('@distube/ytdl-core');

const port = 1000;

// API Types
const apitypes = [
    "all", "default", "initial", "download", "related",
    "info", "video", "audio", "videos", "audios", "dv", "da", "alltypes"
];

// POST API
app.post('/', async (req, res) => {
    try {
        let { url, type, cookies } = req.body;

        if (!url || !type) {
            return res.status(400).json({ error: true, message: "url and type are required" });
        }

        // Clean URL
        const objectToFind = '?si=';
        if (url.includes(objectToFind)) {
            url = url.split(objectToFind)[0];
        }

        // Convert JSON cookies to cookie string
        let cookieHeader = '';
        if (cookies && typeof cookies === 'object') {
            cookieHeader = Object.entries(cookies)
                .map(([key, value]) => `${key}=${value}`)
                .join('; ');
        }

        // Options for ytdl
        const options = {
            requestOptions: {
                headers: {
                    cookie: cookieHeader,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            }
        };

        // Fetch info from YouTube
        const ytInfo = await ytdl.getInfo(url, options);

        // Prepare response based on type
        let responseData;
        switch (type) {
            case "all":
                responseData = ytInfo;
                break;
            case "default":
                responseData = {
                    videoDetails: ytInfo.videoDetails,
                    formats: ytInfo.formats
                };
                break;
            case "video":
                responseData = ytdl.filterFormats(ytInfo.formats, 'video');
                break;
            case "audio":
                responseData = ytdl.filterFormats(ytInfo.formats, 'audio');
                break;
            default:
                responseData = { error: true, message: "Unknown type" };
        }

        return res.status(200).json(responseData);

    } catch (err) {
        return res.status(500).json({ error: true, message: err.toString() });
    }
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
