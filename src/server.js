import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BrowserScraper } from './browser-scraper.js';
import { NvidiaNimClient } from './nvidia-nim-client.js';
import { QueueManager } from './queue-manager.js';
import { Logger } from './logger.js';

// Load .env from multiple possible paths
const envPaths = ['./.env', './.env.local', '../.env'];
let envLoaded = false;
for (const path of envPaths) {
  try {
    const result = dotenv.config({ path });
    if (!result.error && result.parsed) {
      console.log(`Loaded .env from: ${path}`);
      envLoaded = true;
      break;
    }
  } catch (e) {
    // Continue to next path
  }
}

// Fallback: load from default path
if (!envLoaded) {
  dotenv.config();
}

const app = express();
const logger = new Logger('server');

// Log configuration
console.log('=== NVIDIA NIM Scraper Starting ===');
console.log('Model:', process.env.NVIDIA_NIM_MODEL || 'not set');
console.log('Base URL:', process.env.NVIDIA_NIM_BASE_URL || 'not set');
console.log('API Key exists:', process.env.NVIDIA_NIM_API_KEY ? 'YES' : 'NO');
console.log('API Key prefix:', process.env.NVIDIA_NIM_API_KEY ? process.env.NVIDIA_NIM_API_KEY.substring(0, 20) + '...' : 'N/A');
console.log('==================================');

// Initialize services
const nvidiaClient = new NvidiaNimClient(
  process.env.NVIDIA_NIM_API_KEY,
  process.env.NVIDIA_NIM_BASE_URL,
  process.env.NVIDIA_NIM_MODEL
);

const scraper = new BrowserScraper({
  headless: process.env.BROWSER_HEADLESS === 'true',
  timeout: parseInt(process.env.BROWSER_TIMEOUT) || 60000
});

const queueManager = new QueueManager(process.env.REDIS_URL);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    nvidia_configured: !!process.env.NVIDIA_NIM_API_KEY
  });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    nvidia_nim_model: process.env.NVIDIA_NIM_MODEL || 'not set',
    nvidia_nim_base_url: process.env.NVIDIA_NIM_BASE_URL || 'not set',
    nvidia_nim_api_key: process.env.NVIDIA_NIM_API_KEY ? 'configured (prefix: ' + process.env.NVIDIA_NIM_API_KEY.substring(0, 20) + '...)' : 'NOT SET',
    port: process.env.PORT || '10000 (default)',
    node_env: process.env.NODE_ENV || 'not set'
  });
});

// NVIDIA API test endpoint
app.get('/test-nvidia', async (req, res) => {
  try {
    console.log('Testing NVIDIA API...');
    const testResult = await nvidiaClient.generateCompletion('Say hello!');
    res.json({ success: true, response: testResult });
  } catch (error) {
    console.error('NVIDIA test error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// Single scrape
app.post('/scrape', async (req, res) => {
  try {
    const { url, instructions, selectors } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await scraper.scrapeWithLLM(url, {
      instructions,
      selectors,
      nvidiaClient
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Scrape error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI-powered scrape
app.post('/scrape/ai', async (req, res) => {
  try {
    const { query, maxPages } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await scraper.aiScrape(query, maxPages || 5, nvidiaClient);
    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('AI scrape error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch scrape
app.post('/scrape/batch', async (req, res) => {
  try {
    const { urls, instructions, selectors } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    const jobId = await queueManager.addBatchJob(urls, instructions, selectors);
    res.json({ success: true, jobId });
  } catch (error) {
    logger.error('Batch scrape error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get job status
app.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await queueManager.getJobStatus(jobId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { app };