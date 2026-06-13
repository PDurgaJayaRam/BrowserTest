import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BrowserScraper } from './browser-scraper.js';
import { NvidiaNimClient } from './nvidia-nim-client.js';
import { QueueManager } from './queue-manager.js';
import { Logger } from './logger.js';

dotenv.config();

const app = express();
const logger = new Logger('server');

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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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