# LinkedIn Vision Scraper 2.0

Advanced LinkedIn scraper using Puppeteer for browser automation and Google's Gemini Vision API for data extraction.

## Features

- Human-like browsing behavior to avoid detection
- Automatic login using cookies or credentials
- Smart search with location filtering
- Full-page screenshot capture
- Gemini Vision API analysis for data extraction
- Clean, formatted output of decision-makers

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Google Gemini API Key** - [Get one here](https://aistudio.google.com/app/apikey)
3. **LinkedIn Cookies** or credentials

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/linkedin-vision-scraper2.0.git
   cd linkedin-vision-scraper2.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Add LinkedIn credentials (optional):
   ```env
   LINKEDIN_EMAIL=your@email.com
   LINKEDIN_PASSWORD=your_password
   ```

5. Export LinkedIn cookies (recommended):
   - Log in to LinkedIn in Chrome
   - Use the "Get cookies.txt" extension to export cookies as `cookies.json`

## Usage

Run the scraper with your search parameters:

```bash
node run.js --keyword "data science" --location "Hyderabad"
```

### Command-line Options

| Option      | Description                  | Required | Default Value     |
|-------------|------------------------------|----------|-------------------|
| `--keyword` | Search keyword               | Yes      | "data science"   |
| `--location`| Location filter              | Yes      | "Hyderabad"      |

## Output

The script will:
1. Launch a browser and perform the search
2. Save a full-page screenshot in `/screenshots/results.png`
3. Analyze the screenshot using Gemini Vision API
4. Display extracted decision-maker profiles in the console

Example output:
```
Extracted Decision Makers:
------------------------------------------------
1. Rajesh Kumar
   Role: Senior Data Scientist
   Company: Tech Solutions India
   Location: Hyderabad, Telangana
------------------------------------------------
2. Priya Sharma
   Role: Head of Data Analytics
   Company: Innovation Labs
   Location: Hyderabad, India
------------------------------------------------
```

## Notes

- The browser will run in non-headless mode by default for better debugging
- For production use, set `headless: true` in `run.js`
- Results depend on LinkedIn's current layout and Gemini's interpretation