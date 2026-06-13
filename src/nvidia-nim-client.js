import axios from 'axios';

export class NvidiaNimClient {
  constructor(apiKey, baseUrl, model) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://integrate.api.nvidia.com/v1';
    this.model = model || 'deepseek-ai/deepseek-v4-flash';
  }

  async generateCompletion(prompt, systemPrompt = null, options = {}) {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    // Full endpoint URL
    const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/chat/completions`;

    console.log('=== NVIDIA NIM Debug ===');
    console.log('Endpoint:', endpoint);
    console.log('Model:', this.model);
    console.log('Has API Key:', this.apiKey ? `yes (${this.apiKey.substring(0, 10)}...)` : 'no');

    try {
      const response = await axios.post(
        endpoint,
        {
          model: this.model,
          messages,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 60000
        }
      );

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.status === 200);

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA NIM Error Details:');
      console.error('  Status:', error.response?.status);
      console.error('  Data:', error.response?.data);
      console.error('  Message:', error.message);
      
      throw new Error(`NVIDIA NIM API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Simple test method
  async testConnection() {
    try {
      const result = await this.generateCompletion('Say hello!');
      return { success: true, response: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}