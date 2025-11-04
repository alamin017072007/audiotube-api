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

// Helper: Convert JSON cookies to cookie string
const convertCookiesToHeader = (cookies) => {
    if (!cookies || typeof cookies !== 'object') return '';
    return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
};

// Main POST API
app.post('/', async (req, res) => {
    try {
        let { url, type, cookies } = req.body;

        if (!url || !type) {
            return res.status(400).json({ error: true, message: "url and type are required" });
        }

        // Clean URL (remove ?si=)
        if (url.includes('?si=')) url = url.split('?si=')[0];

        // Convert cookies JSON to string
        const cookieHeader = convertCookiesToHeader(cookies);

        // ytdl options with proper headers
        const options = {
            requestOptions: {
                headers: {
                    cookie: cookieHeader,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
                }
            }
        };

        // Fetch YouTube info
        const ytInfo = await ytdl.getInfo(url, options);

        // Prepare normalized response
        const videoOnly = ytdl.chooseFormat(ytdl.filterFormats(ytInfo.formats, 'audioandvideo'), { quality: '18' }) || null;
        const audioOnly = ytdl.chooseFormat(ytdl.filterFormats(ytInfo.formats, 'audioonly'), { quality: '140' }) || null;
        const related = ytInfo.related_videos || [];

        let responseData;
        switch (type) {
            case "all":
                responseData = ytInfo;
                break;
            case "default":
                responseData = {
                    videoDetails: ytInfo.videoDetails,
                    videoOnly,
                    audioOnly,
                    relatedVideos: related
                };
                break;
            case "video":
                responseData = ytdl.filterFormats(ytInfo.formats, 'video');
                break;
            case "audio":
                responseData = ytdl.filterFormats(ytInfo.formats, 'audio');
                break;
            case "related":
                responseData = related;
                break;
            case "download":
                responseData = { videoOnly, audioOnly };
                break;
            case "alltypes":
                responseData = apitypes;
                break;
            default:
                responseData = { error: true, message: "Unknown type" };
        }

        return res.status(200).json(responseData);

    } catch (err) {
        // If YouTube detects bot or CAPTCHA
        if (err.message.includes('Sign in to confirm you’re not a bot')) {
            return res.status(403).json({ error: true, message: "YouTube bot detection triggered. Check cookies and User-Agent." });
        }
        return res.status(500).json({ error: true, message: err.toString() });
    }
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
