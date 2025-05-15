const express = require('express');
const { exec } = require('child_process');
const ytdl= require('@distube/ytdl-core')
const app = express();

const PORT = 3000;

app.get('/', async(req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  const command = `yt-dlp -g -f bestvideo+bestaudio "${videoUrl}"`;
  const v= await ytdl.getInfo(videoUrl)
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const urls = stdout.trim().split('\n');
  
    const result = {
      video: urls[0] || null,
      audio: urls[1] || null, 
      related_videos:v.related_videos
    };

    res.json(result);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
