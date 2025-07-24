import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

  console.log('🔑 Please login manually in the browser...');
  await page.waitForSelector('.global-nav__me', { timeout: 300000 }); // wait up to 5 min

  const cookies = await page.cookies();
  fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
  console.log('✅ Cookies saved to cookies.json');

  await browser.close();
})();
