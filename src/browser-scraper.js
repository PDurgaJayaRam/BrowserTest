import axios from 'axios';
import * as cheerio from 'cheerio';
import { analyzeWithAI, extractDataWithAI, generateSearchQueries } from './ai-scraper.js';

export class BrowserScraper {
  constructor(options = {}) {
    this.options = {
      headless: options.headless ?? true,
      timeout: options.timeout ?? 60000,
      viewport: options.viewport ?? { width: 1920, height: 1080 }
    };
  }

  async scrapeWithLLM(url, options) {
    const { instructions, selectors, nvidiaClient } = options;
    let result = {
      url,
      timestamp: new Date().toISOString(),
      data: null,
      metadata: {}
    };

    try {
      // Use axios + cheerio for lightweight scraping
      const response = await axios.get(url, {
        timeout: this.options.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      const html = response.data;
      result.metadata.title = this.extractTitle(html);
      result.metadata.url = response.request.res.responseUrl || url;

      if (selectors && selectors.length > 0) {
        result.data = this.extractWithSelectors(html, selectors);
      } else if (instructions) {
        // Use LLM to understand and extract
        result.data = await analyzeWithAI(html, instructions, nvidiaClient);
      } else {
        // Smart extraction - let AI decide what to extract
        result.data = await extractDataWithAI(html, nvidiaClient);
      }

      return result;
    } catch (error) {
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }

  extractWithSelectors(html, selectors) {
    const extractedData = {};
    const $ = cheerio.load(html);

    for (const selector of selectors) {
      try {
        const elements = $(selector);
        const texts = elements.map((i, el) => $(el).text().trim()).get().filter(t => t);
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

    for (const searchQuery of searchQueries.slice(0, maxPages)) {
      try {
        // Use DuckDuckGo HTML search (lighter than Google)
        const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
        
        const response = await axios.get(searchUrl, {
          timeout: this.options.timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const $ = cheerio.load(response.data);
        const results = [];

        // Extract search results
        $('.result__title a').each((i, link) => {
          if (i < 10) {
            const href = $(link).attr('href');
            const title = $(link).text().trim();
            if (href && href.startsWith('http')) {
              results.push({ title, url: href });
            }
          }
        });

        allResults.push(...results);
      } catch (error) {
        console.error(`Search scrape error for ${searchQuery}:`, error.message);
      }
    }

    return allResults.slice(0, 50);
  }

  async smartExtract(url, fields, nvidiaClient) {
    try {
      const response = await axios.get(url, {
        timeout: this.options.timeout,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });

      const $ = cheerio.load(response.data);
      const extracted = {};

      for (const field of fields || []) {
        extracted[field] = $('body').text().trim().substring(0, 500);
      }

      return extracted;
    } catch (error) {
      throw new Error(`Smart extraction failed: ${error.message}`);
    }
  }
}