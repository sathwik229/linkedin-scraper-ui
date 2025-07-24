import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';
dotenv.config();
import chalk from 'chalk';
import ora from 'ora';
import { fileURLToPath } from 'url';
import { extractFromImage } from './extractFromOCR.js';
import { saveToAirtable } from './airtableClient.js';

puppeteer.use(StealthPlugin());

// Fix __dirname for Windows ES modules
const __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);
if (process.platform === 'win32' && __dirname.startsWith('/')) __dirname = __dirname.slice(1);

const cookiesPath = path.join(__dirname, 'cookies.json');
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

console.log('SCRIPT LOADING!');
console.log('🚀 Script started...');

let browser;
let page;
let loggedInAlready = false;

export async function getBrowserPage() {
  const cookiesSaved = await fs.pathExists(cookiesPath);
  const headlessMode = cookiesSaved;
  if (!browser) {
    browser = await puppeteer.launch({ headless: headlessMode, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);
    await setupHumanBehavior(page);
  }
  return page;
}

export async function ensureLoggedIn(page) {
  const cookiesSaved = await fs.pathExists(cookiesPath);
  let cookies;

  if (!loggedInAlready) {
    if (cookiesSaved) {
      try {
        const txt = await fs.readFile(cookiesPath, 'utf-8');
        cookies = JSON.parse(txt);
        console.log(chalk.green('✅ Loaded cookies from cookies.json'));
      } catch {
        console.log(chalk.red('❌ Failed to read cookies.json — will delete and retry.'));
        await fs.unlink(cookiesPath);
        return ensureLoggedIn(page);
      }
    } else if (process.env.COOKIE_JSON) {
      try {
        cookies = JSON.parse(process.env.COOKIE_JSON);
        console.log(chalk.green('📦 Loaded cookies from environment variable COOKIE_JSON'));
      } catch {
        console.log(chalk.red('❌ Invalid COOKIE_JSON format.'));
        process.exit(1);
      }
    } else {
      console.log(chalk.red('❌ No valid cookie source found. Please provide cookies.'));
      process.exit(1);
    }

    // Try using the cookies
    await page.setCookie(...cookies);
    try {
      await page.goto('https://www.linkedin.com/feed', { waitUntil: 'domcontentloaded', timeout: 100000 });
    } catch (err) {
      console.log(chalk.red('❌ Failed to load LinkedIn feed (cookies may be expired)!'));
      process.exit(1);
    }

    if (!(await checkLoginStatus(page))) {
      console.log(chalk.red('❌ Cookies invalid or expired.'));
      process.exit(1);
    }

    console.log(chalk.green('✅ Logged in using cookies (file or env)!'));
    loggedInAlready = true;
  }
}

async function start(keyword) {
  const page = await getBrowserPage();
  await ensureLoggedIn(page);
  const results = await startScraping(page, keyword);
  return results;
}

async function setupHumanBehavior(page) {
  await page.evaluateOnNewDocument(() => {
    window.addEventListener('mousemove', e => {
      window.lastMouseMove = { x: e.clientX, y: e.clientY, time: Date.now() };
    });
  });

  await page.evaluateOnNewDocument(() => {
    const originalSetAttribute = window.Element.prototype.setAttribute;
    window.Element.prototype.setAttribute = function (name, value) {
      if (name === 'value' && this.tagName === 'INPUT') {
        const delay = Math.random() * 100 + 50;
        setTimeout(() => originalSetAttribute.apply(this, [name, value]), delay);
      } else {
        return originalSetAttribute.apply(this, arguments);
      }
    };
  });
}

async function loginToLinkedIn(page) {
  console.log(chalk.yellow('🛑 Manual login required. A browser window has opened. Please log into LinkedIn manually IN THAT WINDOW.'));
  try {
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (error) {
    console.log(chalk.red('Failed to load LinkedIn login page!'));
    process.exit(1);
  }
  await new Promise(resolve => process.stdin.once('data', resolve)); // wait user enter key

  const isLoggedIn = await checkLoginStatus(page);
  if (isLoggedIn) {
    console.log(chalk.green('✅ Login successful! Saving cookies...'));
    const cookies = await page.cookies();
    await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log(chalk.green('Cookies saved!'));
  } else {
    console.log(chalk.red('❌ Login failed!'));
    process.exit(1);
  }
}

async function checkLoginStatus(page) {
  try {
    await page.goto('https://www.linkedin.com/feed', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.global-nav__me', { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

function generateLinkedInSearchLink(person) {
  const keywords = [person.name, person.company].filter(Boolean).join(' ').trim();
  const encodedKeywords = encodeURIComponent(keywords);
  return `https://www.linkedin.com/search/results/people/?keywords=${encodedKeywords}`;
}

async function startScraping(page, keyword) {
  const spinner = ora({ text: chalk.blue('Starting new search...'), color: 'blue' }).start();

  try {
    spinner.text = chalk.blue(`Performing LinkedIn search for OCR keyword: "${keyword}"...`);

    // Go to LinkedIn people search
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keyword)}&origin=GLOBAL_SEARCH_HEADER`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    // Wait for results to load and scroll
    await waitForResults(page);

    // Take screenshot
    const screenshotPath = path.join(screenshotsDir, `results_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true, type: 'png' });
    spinner.succeed(chalk.green(`Screenshot saved to: ${screenshotPath}`));
    spinner.start(chalk.blue('Analyzing screenshot with OCR...'));

    // Run OCR and parse results
    const results = await extractFromImage(screenshotPath);
    spinner.stop();

    console.log(chalk.green.bold('\nExtracted Decision Makers:'));
    console.log(chalk.gray('------------------------------------------------'));
    console.log(results);

    return results;
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error.message}`));
    try {
      await page.screenshot({ path: 'error.png', fullPage: true });
    } catch (_) {}
    return [];
  }
}

async function waitForResults(page) {
  try {
    await page.waitForSelector('.reusable-search__result-container, .search-results-container', { timeout: 30000 });
    let currentPosition = 0;
    let scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const scrollStep = 500;
    while (currentPosition < scrollHeight) {
      const randomStep = scrollStep + Math.floor(Math.random() * 300);
      currentPosition += randomStep;
      await page.evaluate(pos => window.scrollTo(0, pos), currentPosition);
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight > scrollHeight) scrollHeight = newHeight;
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    await (await page.browser().newPage()).screenshot({ path: 'debug_failed_results.png', fullPage: true });
    console.log(chalk.yellow('📸 Screenshot of failed result page saved as debug_failed_results.png'));
    throw new Error(`Waiting for results failed: ${error.message}`);
  }
}

async function performSearch(page, keyword) {
  try {
    const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keyword)}&origin=GLOBAL_SEARCH_HEADER`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log(chalk.green('🔍 Search loaded successfully'));
  } catch (error) {
    await (await page.browser().newPage()).screenshot({ path: 'search_error.png', fullPage: true });
    console.log(chalk.yellow('📸 Screenshot of search failure saved as search_error.png'));
    throw new Error(`Search failed: ${error.message}`);
  }
}

// Export start for use in scraper.js
export { start };
