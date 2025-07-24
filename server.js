import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeCompany } from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Enable CORS for all routes
app.use(cors());
app.options('*', cors()); // <-- ✅ CORS preflight fix

// Body parser
app.use(express.json());

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Scrape route
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

// Default route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
