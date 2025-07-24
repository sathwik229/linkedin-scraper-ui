const { Storage } = require('@google-cloud/storage');
const fs = require('fs');

const bucketName = 'linkedin-scraper-data';
const fileName = 'cookies.json';
const destination = './cookies.json'; // Local path

async function downloadCookiesFromGCS() {
  const storage = new Storage();

  const options = {
    destination: destination,
  };

  await storage.bucket(bucketName).file(fileName).download(options);
  console.log(`✅ Downloaded ${fileName} from GCS to ${destination}`);

  const cookies = JSON.parse(fs.readFileSync(destination, 'utf8'));
  return cookies;
}

module.exports = { downloadCookiesFromGCS }; 