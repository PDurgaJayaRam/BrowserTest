// Test NVIDIA NIM API directly
const axios = require('axios');

const apiKey = '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';
const baseUrl = 'https://integrate.api.nvidia.com/v1';
const model = 'deepseek-ai/deepseek-v4-flash';

async function test() {
  console.log('Testing NVIDIA NIM API...\n');
  
  try {
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages: [{ role: 'user', content: 'Hello! Say hi back.' }],
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ SUCCESS!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

test();