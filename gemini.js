// gemini.js
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateLinkedInURL(text) {
  const model = genAI.getGenerativeModel({
    model: 'models/gemini-1.5-pro',
  });

  const prompt = `
From this text:
"${text}"
Find the most accurate LinkedIn profile URL for the person mentioned.
If none is found, say "No profile found".
Only return the link.
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
} 