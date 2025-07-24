import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

  try {
    const cookies = await downloadCookiesFromGCS();

    // ⛔ NOTE: Puppeteer page must exist
    // You should call `puppeteer.launch()` and `page = await browser.newPage()` somewhere
    const page = await globalThis.page; // Adjust this as per your Puppeteer setup

    for (const cookie of cookies) {
      await page.setCookie(cookie);
    }

    const result = await scrapeCompany(company);
    res.json({ status: 'success', data: result });
  } catch (err) {
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
