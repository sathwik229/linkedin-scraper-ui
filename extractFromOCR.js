import { analyzeScreenshot } from './vision.js';
export async function extractFromImage(imagePath) {
  return analyzeScreenshot(imagePath);
} 