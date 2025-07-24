import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import chalk from "chalk";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract decision maker data using Gemini Vision API from screenshot.
 * Returns an array of objects: { name, role, company, location, profile_url }
 */
export async function analyzeScreenshot(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) throw new Error(`Screenshot not found at: ${imagePath}`);

    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    const prompt = `
      This is a screenshot of LinkedIn people search results. 
      For each visible professional in the results, extract as JSON list:
        - name: Person's full name
        - role: Job title
        - company: Current company
        - location: City, state, country
        - profile_url: If appears in the image, else "N/A"
      Only include people who are decision-makers (executives, managers, directors, founders).
      Only return a JSON array, NO additional text or explanation.
      If data is missing, use "N/A".
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/png" // or jpeg if your screenshots are jpeg
        }
      }
    ]);
    const response = await result.response;
    const text = response.text();

    // Log model output for debugging
    console.log(chalk.gray('\n--- Gemini Raw Output ---\n' + text + '\n-------------------------\n'));

    // Extract JSON array from model output
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const jsonString = text.substring(jsonStart, jsonEnd);
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      // Show raw Gemini output if parsing fails
      console.error(chalk.red("Failed to parse Gemini response as JSON."));
      return [];
    }
  } catch (error) {
    console.error(chalk.red(`Vision analysis error: ${error.message}`));
    return [];
  }
}

/**
 * Uses Gemini Pro (text) to generate/guess a plausible LinkedIn profile URL.
 * Returns the URL or "N/A" if cannot be generated.
 */
export async function guessProfileLink({ name, role, company, location }) {
  try {
    const prompt = `
Given the LinkedIn profile information below:
Name: ${name}
Role: ${role}
Company: ${company}
Location: ${location}
Provide the most likely LinkedIn profile URL in the format https://linkedin.com/in/username or "N/A" if it cannot be guessed.
Just return the URL or N/A.
`;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Basic sanity check: only accept valid-looking URLs
    if (!text.toLowerCase().startsWith("http")) return "N/A";
    return text;
  } catch (error) {
    console.error(chalk.red(`Error generating profile link guess: ${error.message}`));
    return "N/A";
  }
}