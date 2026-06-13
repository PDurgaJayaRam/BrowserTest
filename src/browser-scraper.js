import puppeteer from 'puppeteer';
import { analyzeWithAI, extractDataWithAI, generateSearchQueries } from './ai-scraper.js';

export class BrowserScraper {
  constructor(options = {}) {
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 60000,
      viewport: options.viewport ?? { width: 1920, height: 1080 }
    };
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.options.headless ? 'new' : false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        timeout: this.options.timeout
      });
    }
    return this.browser;
  }

  async scrapeWithLLM(url, options) {
    const { instructions, selectors, nvidiaClient } = options;
    let result = {
      url,
      timestamp: new Date().toISOString(),
      data: null,
      metadata: {}
    };

    let browser;
    try {
      browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport(this.options.viewport);
      
      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.options.timeout 
      });

      // Get page content
      const pageContent = await page.content();
      result.metadata.title = await page.title();
      result.metadata.url = page.url();

      if (selectors && selectors.length > 0) {
        // Extract using provided selectors
        result.data = await this.extractWithSelectors(page, selectors);
      } else if (instructions) {
        // Use LLM to understand and extract
        result.data = await analyzeWithAI(pageContent, instructions, nvidiaClient);
      } else {
        // Smart extraction - let AI decide what to extract
        result.data = await extractDataWithAI(pageContent, nvidiaClient);
      }

      await page.close();
      return result;
    } catch (error) {
      if (browser) {
        try {
          const pages = await browser.pages();
          await Promise.all(pages.map(p => p.close()));
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  async extractWithSelectors(page, selectors) {
    const extractedData = {};

    for (const selector of selectors) {
      try {
        const texts = await page.$$eval(selector, elements => 
          elements.map(el => el.textContent.trim()).filter(t => t)
        );
        extractedData[selector] = texts;
      } catch (error) {
        extractedData[selector] = { error: error.message };
      }
    }

    return extractedData;
  }

  async aiScrape(query, maxPages, nvidiaClient) {
    const searchQueries = await generateSearchQueries(query, nvidiaClient);
    const allResults = [];

    let browser;
    try {
      browser = await this.initBrowser();

      for (const searchQuery of searchQueries.slice(0, maxPages)) {
        try {
          // Search and scrape results
          const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
          
          const page = await browser.newPage();
          await page.setViewport(this.options.viewport);
          await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: this.options.timeout });

          // Extract search results from DuckDuckGo
          const results = await page.$$eval('.result__title a', links => 
            links.map(link => ({
              title: link.textContent.trim(),
              url: link.href
            })).filter(r => r.url && r.url.startsWith('http'))
          ).catch(() => []);

          allResults.push(...results.slice(0, 10));
          await page.close();
        } catch (error) {
          console.error(`Search scrape error for ${searchQuery}:`, error.message);
        }
      }

      // Close browser
      await browser.close();
      this.browser = null;

      return allResults.slice(0, 50);
    } catch (error) {
      if (browser) {
        await browser.close();
        this.browser = null;
      }
      return [{ error: `AI scrape failed: ${error.message}` }];
    }
  }

  async smartExtract(url, fields, nvidiaClient) {
    const strategy = await nvidiaClient.generateScrapingStrategy(url, fields.join(', '));
    
    let browser;
    try {
      const parsedStrategy = JSON.parse(strategy);
      browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setViewport(this.options.viewport);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: this.options.timeout });

      // Wait for specific conditions
      for (const condition of parsedStrategy.waitConditions || []) {
        try {
          await page.waitForSelector(condition, { timeout: 5000 });
        } catch (error) {
          // Continue with defaults
        }
      }

      // Extract data
      const extracted = {};
      for (const field of parsedStrategy.dataExtractionFields || []) {
        extracted[field] = await this.extractField(page, parsedStrategy.recommendedSelectors || []);
      }

      await page.close();
      return extracted;
    } catch (error) {
      if (browser) {
        try {
          const pages = await browser.pages();
          await Promise.all(pages.map(p => p.close()));
        } catch (e) {}
      }
      throw new Error(`Smart extraction failed: ${error.message}`);
    }
  }

  async extractField(page, selectors) {
    for (const selector of selectors) {
      try {
        const text = await page.$eval(selector, el => el.textContent.trim());
        if (text) return text;
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}