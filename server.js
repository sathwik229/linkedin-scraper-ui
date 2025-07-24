import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeCompany } from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Allowed origins for CORS
const allowedOrigins = [
  'https://linkedin-scraper-ui-84750544973.europe-west1.run.app',
  'https://linkedin-scraper-ui.onrender.com', // <-- Added Render frontend
  'http://localhost:3000',
  'http://localhost:8080'
];

// ✅ CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman/curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
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

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Scrape endpoint
app.post('/scrape', async (req, res) => {
  console.log('📥 Received /scrape request:', req.body);
  const { company } = req.body;

  if (!company) {
    return res.status(400).json({ error: 'Company name required' });
  }

  try {
    const result = await scrapeCompany(company);
    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('❌ Scrape error:', err.message);
    res.status(500).json({ error: 'Failed to scrape company info', details: err.message });
  }
});

// ✅ Catch-all route for SPA (frontend routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
