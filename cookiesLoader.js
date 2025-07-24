import { Storage } from '@google-cloud/storage';
import { readFileSync } from 'fs';

const bucketName = 'linkedin-scraper-data';
const fileName = 'cookies.json';
const destination = './cookies.json';

export async function downloadCookiesFromGCS() {
  const storage = new Storage();

  const options = {
    destination: destination,
  };

  await storage.bucket(bucketName).file(fileName).download(options);
  console.log(`✅ Downloaded ${fileName} from GCS to ${destination}`);

  const cookies = JSON.parse(readFileSync(destination, 'utf8'));
  return cookies;
} 