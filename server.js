import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import { scrapeCompany } from './scraper.js';
import { downloadCookiesFromGCS } from './cookiesLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

console.log('SCRIPT LOADING!');
console.log('🚀 Script started...');

// ✅ Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://linkedin-scraper-ui-84750544973.europe-west1.run.app' // Cloud Run URL
];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman, curl, etc.
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`❌ CORS blocked from origin: ${origin}`);
      return callback(new Error('CORS not allowed from this origin'), false);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors());

// ✅ Body parser
app.use(express.json());

// ✅ Serve frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Scrape endpoint
app.post('/scrape', async (req, res) => {
  console.log('📥 Received /scrape request:', req.body);
  const { company } = req.body;

  if (!company) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  let browser;
  try {
    // 1. Launch Puppeteer
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    const page = await browser.newPage();

    // 2. Download and set cookies
    const cookies = await downloadCookiesFromGCS();
    await page.setCookie(...cookies);

    // 3. Go to the LinkedIn company "People" page
    await page.goto(`https://www.linkedin.com/company/${encodeURIComponent(company)}/people/`, { waitUntil: 'networkidle2' });

    // 4. Scrape employee names (update selector as needed)
    const employees = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.org-people-profile-card__profile-title');
      return Array.from(nodes).map(node => ({
        name: node.innerText.trim(),
      }));
    });

    await browser.close();
    res.json({ results: employees });
  } catch (err) {
    if (browser) await browser.close();
    console.error('❌ Scrape error:', err.message);
    res.status(500).json({ error: 'Failed to scrape company info', details: err.message });
  }
});

// ✅ SPA fallback (if frontend uses routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
