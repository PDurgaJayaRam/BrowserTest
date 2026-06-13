// Simple test script
import axios from 'axios';

async function test() {
  console.log('Testing scraper...\n');
  
  // Health check
  console.log('1. Health check:');
  const h = await axios.get('https://browsertest-ujvg.onrender.com/health');
  console.log('   Status:', h.data);
  
  // Basic scrape (fallback mode)
  console.log('\n2. Basic scrape test:');
  try {
    const s = await axios.post('https://browsertest-ujvg.onrender.com/scrape', {
      url: 'https://example.com',
      instructions: 'Extract page title'
    });
    console.log('   Result:', s.data);
  } catch (e) {
    console.log('   Error:', e.response?.data || e.message);
  }
}

test().catch(console.error);