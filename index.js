const express = require('express');
const http = require('http');
const fs = require('fs');
const ytdl = require('@distube/ytdl-core');
// const ytdl = require('ytdl-core')

const app = express();
app.use(express.json());

const server = http.createServer(app);
const port = 1000;

// --- Constants ---
const _authKey = "1138";
const apitypes = [
  "all", "default", "initial", "download", "related",
  "info", "video", "audio", "videos", "audios",
  "dv", "da", "alltypes"
];

const urlList = [
  "https://www.youtube.com/watch?v=QOMnzE2Ujzc",
  "https://www.youtube.com/watch?v=s-00rrCI8ac",
  "https://www.youtube.com/watch?v=dWBgNHT4ipE",
  "https://www.youtube.com/watch?v=rL6qQ49hBlQ",
  "https://www.youtube.com/watch?v=Jk0Xv1adP3s",
  "https://www.youtube.com/watch?v=lW9djo-zm7k",
  "https://www.youtube.com/watch?v=9OZtJUEXykE",
  "https://www.youtube.com/watch?v=IH6Z2Hid338",
  "https://www.youtube.com/watch?v=Mev3TVUNqbI",
  "https://www.youtube.com/watch?v=De-bLfEUeLE"
];

let options = {};

// ====================================================
// =============== Main POST API ======================
// ====================================================

app.post('/', async (req, res) => {
  try {
    let url = req.query.url;
    const type = req.query.type;
    const cookiesInput = req.body.cookies;

    // --- Convert cookies to string ---
    let cookieString = "";

    if (typeof cookiesInput === "string") {
      cookieString = cookiesInput;
    } else if (Array.isArray(cookiesInput)) {
      cookieString = cookiesInput.map(c => `${c.name}=${c.value}`).join("; ");
    } else if (typeof cookiesInput === "object" && cookiesInput !== null) {
      cookieString = Object.entries(cookiesInput)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    }

    // --- Prepare request options ---
    options = cookieString
      ? {
          requestOptions: {
            headers: {
              cookie: cookieString,
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            }
          }
        }
      : {};

    // Clean YouTube tracking param
    const objectToFind = "?si=";
    if (url && url.toString().includes(objectToFind)) {
      url = url.split(objectToFind)[0];
    }

    // Get final response
    const body = await getRes(url, type);
    return res.status(200).json(body).end();

  } catch (err) {
    console.error("Error:", err);
    res.status(500).send(err.toString());
  }
});

// ====================================================
// =============== Helper Functions ===================
// ====================================================

const getRes = async (url, type) => {
  if (!url) return { error: true, message: "URL not provided" };

  url = url.replace('live/', "watch?v=");

  switch (type) {
    case "all":
      return await allResponse(url);
    case "default":
      return await defaultResponse(url);
    case "initial":
      const randomURL = urlList[getRandom(0, urlList.length - 1)];
      return await relatedOnlyResponse(randomURL);
    case "download":
      return await downloadOnlyResponse(url);
    case "related":
      return await relatedOnlyResponse(url);
    case "info":
      return await detailsOnlyResponse(url);
    case "video":
      return await videoOnlyResponse(url);
    case "audio":
      return await audioOnlyResponse(url);
    case "videos":
      return await allVideosResponse(url);
    case "audios":
      return await allAudiosResponse(url);
    case "dv":
      return await videoOnlyResponse(url);
    case "da":
      return await audioOnlyResponse(url);
    case "alltypes":
      return apitypes;
    default:
      return { error: true, message: "Invalid type" };
  }
};

// ====================================================
// ============= YouTube Response Helpers =============
// ====================================================

const allResponse = async (url) => await getYT(url);

const defaultResponse = async (url) => {
  const yt = await getYT(url);
  const dInfo = getDownloadInfo(yt);
  removeUnnecessaryFields(yt);
  return normalJsonResponse(yt, dInfo);
};

const downloadOnlyResponse = async (url) => {
  const yt = await getYT(url);
  removeUnnecessaryFields(yt);
  return getDownloadInfo(yt);
};

const relatedOnlyResponse = async (url) => {
  const yt = await getYT(url);
  return yt.related_videos;
};

const detailsOnlyResponse = async (url) => {
  const yt = await getYT(url);
  return yt.videoDetails;
};

const videoOnlyResponse = async (url) => {
  const yt = await getYT(url);
  const dInfo = getDownloadInfo(yt);
  return dInfo.videoOnly;
};

const audioOnlyResponse = async (url) => {
  const yt = await getYT(url);
  const dInfo = getDownloadInfo(yt);
  return dInfo.audioOnly;
};

const allVideosResponse = async (url) => {
  const yt = await getYT(url);
  return ytdl.filterFormats(yt.formats, 'video');
};

const allAudiosResponse = async (url) => {
  const yt = await getYT(url);
  return ytdl.filterFormats(yt.formats, 'audio');
};

// ====================================================
// =============== Utility Functions ==================
// ====================================================

const removeUnnecessaryFields = (yt) => {
  delete yt.videoDetails.embed;
  delete yt.videoDetails.availableCountries;
  delete yt.videoDetails.media;
  delete yt.videoDetails.storyboards;
  delete yt.videoDetails.chapters;
};

const normalJsonResponse = (yt, dInfo) => ({
  videoDetails: yt.videoDetails,
  videoOnly: dInfo.videoOnly,
  audioOnly: dInfo.audioOnly,
  relatedVideos: yt.related_videos
});

const getYT = async (url) => {
  const yt = await ytdl.getInfo(url, options);
  return yt;
};

const getDownloadInfo = (yt) => {
  const videos = ytdl.filterFormats(yt.formats, 'audioandvideo');
  const audios = ytdl.filterFormats(yt.formats, 'audioonly');
  const audioOnly = ytdl.chooseFormat(audios, { quality: "140" });

  let videoOnly;
  try {
    videoOnly = ytdl.chooseFormat(videos, { quality: "18" });
  } catch (e) {
    videoOnly = videos[0];
  }

  return { videoOnly, audioOnly };
};

const getRandom = (min, max) => Math.floor(Math.random() * (max - min) + min);

// ====================================================
// ================== Start Server ====================
// ====================================================

server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
