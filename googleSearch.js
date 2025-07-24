import puppeteer from 'puppeteer-extra';

export async function performGoogleSearch(keyword, location) {
  const searchQuery = `${keyword} ${location}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const query = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  await page.goto(query, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('h3');

  const results = await page.evaluate(() => {
    const links = [];
    const items = document.querySelectorAll('div.g');
    items.forEach((item) => {
      const title = item.querySelector('h3')?.innerText;
      const link = item.querySelector('a')?.href;
      const snippet = item.querySelector('.VwiC3b')?.innerText;
      if (title && link) {
        links.push({ title, link, snippet });
      }
    });
    return links;
  });

  await browser.close();
  return results;
} 