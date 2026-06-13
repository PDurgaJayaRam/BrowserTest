import { getContext } from '@fc/get-context';
import { HttpRequest } from '@fc/http';
import { BrowserScraper } from '../browser-scraper.js';
import { NvidiaNimClient } from '../nvidia-nim-client.js';

// Initialize clients
const nvidiaClient = new NvidiaNimClient(
  process.env.NVIDIA_NIM_API_KEY,
  process.env.NVIDIA_NIM_BASE_URL,
  process.env.NVIDIA_NIM_MODEL
);

const scraper = new BrowserScraper({
  headless: process.env.BROWSER_HEADLESS === 'true',
  timeout: parseInt(process.env.BROWSER_TIMEOUT) || 60000
});

export async function handler(req, resp) {
  const { method, path, headers, query, body } = req;
  
  // Health check
  if (method === 'GET' && (path === '/health' || path === '/scrape')) {
    resp.setHeader('Content-Type', 'application/json');
    return resp.send(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  }

  // Single scrape
  if (method === 'POST' && path.startsWith('/scrape')) {
    const { url, instructions, selectors } = body;
    
    if (!url) {
      resp.setStatusCode(400);
      resp.setHeader('Content-Type', 'application/json');
      return resp.send(JSON.stringify({ error: 'URL is required' }));
    }

    try {
      const result = await scraper.scrapeWithLLM(url, {
        instructions,
        selectors,
        nvidiaClient
      });
      
      resp.setHeader('Content-Type', 'application/json');
      resp.setStatusCode(200);
      return resp.send(JSON.stringify({ success: true, data: result }));
    } catch (error) {
      resp.setStatusCode(500);
      resp.setHeader('Content-Type', 'application/json');
      return resp.send(JSON.stringify({ error: error.message }));
    }
  }

  // Default response
  resp.setStatusCode(404);
  resp.setHeader('Content-Type', 'application/json');
  return resp.send(JSON.stringify({ error: 'Not found' }));
}