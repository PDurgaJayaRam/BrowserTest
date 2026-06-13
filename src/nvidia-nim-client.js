import axios from 'axios';

export class NvidiaNimClient {
  constructor(apiKey, baseUrl, model) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || 'https://integrate.api.nvidia.com/v1';
    // Try without the path prefix if model includes it
    this.model = model || 'deepseek-ai/deepseek-v4-flash';
  }

  async generateCompletion(prompt, systemPrompt = null, options = {}) {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/chat/completions`;

    console.log('=== NVIDIA NIM Debug ===');
    console.log('Endpoint:', endpoint);
    console.log('Model:', this.model);
    console.log('API Key (first 20 chars):', this.apiKey ? this.apiKey.substring(0, 20) + '...' : 'MISSING');
    console.log('Has API Key:', !!this.apiKey);

    if (!this.apiKey) {
      throw new Error('NVIDIA NIM API key is not configured');
    }

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
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      console.log('Response Status:', response.status);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA NIM Error - Status:', error.response?.status);
      console.error('NVIDIA NIM Error - Response:', error.response?.data);
      throw new Error(`NVIDIA NIM API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async summarizeContent(content, maxLength = 500) {
    const prompt = `Summarize: ${content.substring(0, 8000)}`;
    return this.generateCompletion(prompt, 'Summarize this content.', { maxTokens: 500 });
  }

  async extractStructuredData(content, schema) {
    const prompt = `Extract data according to schema: ${JSON.stringify(schema)}\n\nContent: ${content.substring(0, 6000)}\n\nReturn valid JSON only.`;
    
    const response = await this.generateCompletion(prompt, 'Extract JSON data.', { maxTokens: 2048 });

    try {
      return JSON.parse(response);
    } catch {
      return { error: 'Parse failed', raw: response };
    }
  }

  async generateScrapingStrategy(url, targetInfo) {
    const prompt = `Scraping strategy for: ${url}\nTarget: ${targetInfo}\nReturn JSON with: recommendedSelectors, waitConditions, dataExtractionFields`;
    return this.generateCompletion(prompt, 'Web scraping expert.', { maxTokens: 1024 });
  }
}