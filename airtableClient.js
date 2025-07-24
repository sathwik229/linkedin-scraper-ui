import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

export async function saveToAirtable(record) {
  try {
    const createdRecords = await base(tableName).create([{ fields: record }]);
    console.log(`✅ Saved record Id: ${createdRecords[0].getId()}`);
    return createdRecords[0];
  } catch (err) {
    console.error('Airtable save error:', err);
    throw err;
  }
}
