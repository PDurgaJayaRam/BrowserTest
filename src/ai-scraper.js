import { NvidiaNimClient } from './nvidia-nim-client.js';

export async function analyzeWithAI(content, instructions, nvidiaClient) {
  // Fallback without API call if no client available
  if (!nvidiaClient || !nvidiaClient.apiKey) {
    console.log('Using fallback extraction (no NVIDIA API)');
    // Simple regex-based extraction
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 500);
    return { extracted: text, method: 'fallback_regex' };
  }

  const prompt = `Analyze the following web page content based on these instructions: ${instructions}
  
  Web page content:
  ${content.substring(0, 10000)}
  
  Return a structured JSON object with the extracted information.`;

  try {
    const response = await nvidiaClient.generateCompletion(prompt, 
      'You are an expert data extraction assistant. Extract and structure information accurately.',
      { maxTokens: 2048, temperature: 0.3 }
    );

    try {
      return JSON.parse(response);
    } catch {
      return { extracted: response, raw: true };
    }
  } catch (error) {
    console.log('AI extraction failed, using fallback:', error.message);
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 500);
    return { extracted: text, method: 'fallback', error: error.message };
  }
}

export async function extractDataWithAI(content, nvidiaClient) {
  // Fallback without API call if no client available
  if (!nvidiaClient || !nvidiaClient.apiKey) {
    console.log('Using fallback extract (no NVIDIA API)');
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 500);
    return { summary: text, method: 'fallback_regex' };
  }

  const prompt = `Extract key information from this web page content. Identify:
  - Main title/title heading
  - Key paragraphs or descriptions
  - Any prices, dates, or numbers
  - Links and references
  - Contact information if present
  
  Content:
  ${content.substring(0, 8000)}`;

  try {
    const response = await nvidiaClient.generateCompletion(prompt,
      'You are a data extraction specialist. Return structured JSON with extracted information.',
      { maxTokens: 1500, temperature: 0.3 }
    );

    try {
      return JSON.parse(response);
    } catch {
      return { summary: response };
    }
  } catch (error) {
    console.log('AI extraction failed, using fallback:', error.message);
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 500);
    return { summary: text, method: 'fallback', error: error.message };
  }
}

export async function generateSearchQueries(query, nvidiaClient) {
  // Fallback without API call if no client available
  if (!nvidiaClient || !nvidiaClient.apiKey) {
    console.log('Using fallback search queries (no NVIDIA API)');
    return [
      `${query}`,
      `${query} news`,
      `${query} 2024`,
      `latest ${query}`,
      `${query} update`
    ];
  }

  try {
    const prompt = `Generate 5 effective search queries for finding information about: ${query}
  Return as JSON array of strings only.`;

    const response = await nvidiaClient.generateCompletion(prompt,
      'Generate concise, effective search queries.',
      { maxTokens: 500, temperature: 0.7 }
    );

    try {
      return JSON.parse(response);
    } catch {
      // Fallback
      return [query];
    }
  } catch (error) {
    console.log('Search query generation failed, using fallback:', error.message);
    return [query];
  }
}

export async function summarizePage(content, nvidiaClient) {
  return nvidiaClient.summarizeContent(content);
}

export async function extractProducts(content, nvidiaClient) {
  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        price: { type: "string" },
        description: { type: "string" },
        features: { type: "array", items: { type: "string" } },
        url: { type: "string" }
      }
    }
  };

  return nvidiaClient.extractStructuredData(content, schema);
}

export async function extractArticles(content, nvidiaClient) {
  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        headline: { type: "string" },
        author: { type: "string" },
        publishDate: { type: "string" },
        summary: { type: "string" },
        url: { type: "string" }
      }
    }
  };

  return nvidiaClient.extractStructuredData(content, schema);
}