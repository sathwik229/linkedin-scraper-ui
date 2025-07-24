import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

async function testAirtableSave() {
  const testRecord = {
    Name: 'Test User',
    'Title/Role': 'Airtable Tester',
    Company: 'TestCorp',
    Location: 'Test City',
    'LinkedIn Search Link': 'https://www.linkedin.com/search/results/people/?keywords=Test%20User%20TestCorp'
  };

  try {
    const created = await base(tableName).create([{ fields: testRecord }]);
    console.log('✅ Airtable test record created! Record ID:', created[0].getId());
  } catch (err) {
    console.error('❌ Airtable test failed:', err.message);
  }
}

testAirtableSave(); 