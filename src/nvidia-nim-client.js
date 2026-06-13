import axios from 'axios';

export class NvidiaNimClient {
  constructor(apiKey, baseUrl, model) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateCompletion(prompt, systemPrompt = null, options = {}) {
    const messages = [];
    
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    // Try different endpoint formats
    let endpoint = this.baseUrl;
    
    // Ensure proper endpoint
    if (!endpoint.endsWith('/chat/completions')) {
      endpoint = endpoint.replace(/\/$/, "") + '/chat/completions';
    }

    console.log(`Calling NVIDIA NIM endpoint: ${endpoint}`);
    console.log(`Model: ${this.model}`);
    console.log(`Has API key: ${this.apiKey ? 'yes' : 'no'}`);

    try {
      const response = await axios.post(
        endpoint,
        {
          model: this.model,
          messages,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: options.timeout || 60000,
          validateStatus: (status) => true // Accept all responses
        }
      );

      console.log(`Response status: ${response.status}`);
      
      if (response.status !== 200) {
        console.error('NVIDIA NIM API Response:', response.status, response.data);
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('NVIDIA NIM Error:', error.response?.status, error.response?.data || error.message);
      throw new Error(`NVIDIA NIM API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async summarizeContent(content, maxLength = 500) {
    const prompt = `Summarize the following content in ${maxLength} characters or less. Focus on key information and main points:\n\n${content.substring(0, 8000)}`;
    
    return this.generateCompletion(prompt, 'You are a helpful summarization assistant.', {
      maxTokens: 500,
      temperature: 0.3
    });
  }

  async extractStructuredData(content, schema) {
    const prompt = `Extract data from the following content according to this JSON schema:\n${JSON.stringify(schema, null, 2)}\n\nContent:\n${content.substring(0, 6000)}\n\nReturn ONLY valid JSON matching the schema.`;
    
    const response = await this.generateCompletion(prompt, 'You are a data extraction specialist. Return only valid JSON.', {
      maxTokens: 2048,
      temperature: 0.1
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      return { error: 'Failed to parse LLM response', raw: response };
    }
  }

  async generateScrapingStrategy(url, targetInfo) {
    const prompt = `Analyze this URL and target information to generate a web scraping strategy:
URL: ${url}
Target: ${targetInfo}

Provide a JSON response with:
- recommendedSelectors: array of CSS selectors to try
- waitConditions: array of page load conditions
- paginationSelectors: array of selectors for next page
- dataExtractionFields: array of field names to extract

Format as valid JSON only.`;
    
    return this.generateCompletion(prompt, 'You are a web scraping strategy expert.', {
      maxTokens: 1024,
      temperature: 0.5
    });
  }

  async generateWithThinking(prompt, options = {}) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 1,
        top_p: options.top_p || 0.95,
        max_tokens: options.max_tokens || 16384,
        extra_body: {
          chat_template_kwargs: {
            thinking: options.thinking || false,
            reasoning_effort: options.reasoning_effort || 'medium'
          }
        },
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: options.timeout || 120000
      }
    );

    const message = response.data.choices[0].message;
    const reasoning = message.reasoning || message.reasoning_content || null;
    
    return {
      content: message.content,
      reasoning: reasoning
    };
  }
}