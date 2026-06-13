exports.handler = async (event, context, callback) => {
  const { BrowserScraper } = require('./browser-scraper');
  const { NvidiaNimClient } = require('./nvidia-nim-client');
  
  const nvidiaClient = new NvidiaNimClient(
    process.env.NVIDIA_NIM_API_KEY,
    process.env.NVIDIA_NIM_BASE_URL,
    process.env.NVIDIA_NIM_MODEL
  );

  const scraper = new BrowserScraper({
    headless: process.env.BROWSER_HEADLESS === 'true',
    timeout: parseInt(process.env.BROWSER_TIMEOUT) || 60000
  });

  const method = event.method || 'GET';
  const path = event.path || '/';
  const body = event.body ? JSON.parse(event.body) : {};
  const query = event.queryString || {};

  // Health check
  if (method === 'GET' && (path === '/health' || path === '/' || path === '/scrape')) {
    return callback(null, {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() })
    });
  }

  // Single scrape
  if (method === 'POST' && path.startsWith('/scrape')) {
    const { url, instructions, selectors } = body;
    
    if (!url) {
      return callback(null, {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'URL is required' })
      });
    }

    try {
      const result = await scraper.scrapeWithLLM(url, {
        instructions,
        selectors,
        nvidiaClient
      });
      
      return callback(null, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: result })
      });
    } catch (error) {
      return callback(null, {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message })
      });
    }
  }

  // AI-powered scraping
  if (method === 'POST' && path.startsWith('/scrape/ai')) {
    const { query, maxPages } = body;
    
    if (!query) {
      return callback(null, {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Query is required' })
      });
    }

    try {
      const results = await scraper.aiScrape(query, maxPages || 5, nvidiaClient);
      
      return callback(null, {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, data: results })
      });
    } catch (error) {
      return callback(null, {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message })
      });
    }
  }

  // Default response
  return callback(null, {
    statusCode: 404,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Not found' })
  });
};