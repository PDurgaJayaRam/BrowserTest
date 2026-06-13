// Quick test script for the deployed scraper
const axios = require('axios');

async function testScraper() {
  const baseUrl = 'https://browsertest-ujvg.onrender.com';
  
  console.log('Testing scraper at:', baseUrl);
  
  // Health check
  console.log('\n1. Health check:');
  try {
    const health = await axios.get(`${baseUrl}/health`);
    console.log('✅ Status:', health.data);
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
  
  // Scrape test (will work once NVIDIA_NIM_API_KEY is set in Render)
  console.log('\n2. Scrape test (requires NVIDIA_NIM_API_KEY in Render):');
  console.log('POST /scrape with URL: https://example.com');
  console.log('Body: {"url":"https://example.com","instructions":"Extract page title"}');
}

testScraper();