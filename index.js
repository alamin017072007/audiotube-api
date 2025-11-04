
const express = require('express');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.use(express.json());

app.post('/youtube-download', async (req, res) => {
    const { url, cookies } = req.body;

    if (!url || !cookies) {
        return res.status(400).json({ error: true, message: "Provide 'url' and 'cookies'" });
    }

    // cookies convert to string
    const cookieHeader = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

    try {
        const info = await ytdl.getInfo(url, {
            requestOptions: {
                headers: {
                    'Cookie': cookieHeader,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
                }
            }
        });

        res.json({
            error: false,
            videoDetails: info.videoDetails,
            formats: info.formats.map(f => ({
                quality: f.qualityLabel,
                itag: f.itag,
                container: f.container,
                url: f.url
            }))
        });
    } catch (err) {
        res.status(500).json({ error: true, message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
