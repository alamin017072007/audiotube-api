const puppeteer = require('puppeteer');
const fs = require('fs');

async function loginAndSaveCookies() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Opening YouTube login page...');
  await page.goto('https://www.youtube.com');
  
  console.log('Please log in manually...');
//  await page.waitForTimeout(60000); // Wait for manual login (adjust if needed)
await new Promise((resolve) => setTimeout(resolve, 2000)); // 30 seconds delay


  const cookies = await page.cookies();
  fs.writeFileSync('cook.json', JSON.stringify(cookies, null, 2));
  console.log('Cookies saved to cookies.json');

  await browser.close();
}

loginAndSaveCookies();