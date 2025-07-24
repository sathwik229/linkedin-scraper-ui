import { start } from './run.js';

function generateLinkedInSearchLink(person) {
  const keywords = [person.name, person.company].filter(Boolean).join(' ').trim();
  const encodedKeywords = encodeURIComponent(keywords);
  return `https://www.linkedin.com/search/results/people/?keywords=${encodedKeywords}`;
}

export async function scrapeCompany(companyName) {
  const result = await start(companyName);
  // Add LinkedIn search link for each person
  return (result || []).map(person => ({
    ...person,
    linkedinSearchLink: generateLinkedInSearchLink(person)
  }));
} 