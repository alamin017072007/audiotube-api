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

// Server run
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
~~~

✅ **ব্যবহার করার উপায়:**  

1. Run করো Node.js এ:
```bash
node index.js
```

2. Postman বা অন্য কোনো HTTP client থেকে request পাঠাও:
- Method: POST  
- URL: `http://localhost:3000/youtube`  
- Body (JSON):
```json
{
  "url": "https://www.youtube.com",
  "cookies": {
    "SAPISID": "YOUR_SAPISID",
    "HSID": "YOUR_HSID",
    "SSID": "YOUR_SSID",
    "APISID": "YOUR_APISID",
    "SID": "YOUR_SID",
    "__Secure-3PAPISID": "YOUR_3PAPISID",
    "__Secure-3PSID": "YOUR_3PSID"
  }
}
```

📝 **Tip:**  
- Fresh cookies ব্যবহার করতে হবে।  
- Frequent requests করলে bot detection trigger হতে পারে।  

আমি চাইলে এটাকে **dynamic video search** করার মতো API তেও upgrade করতে পারি, যাতে তুমি শুধু `query` পাঠাও আর response হিসেবে YouTube results পাই।  
চাও আমি সেটা বানাই?
