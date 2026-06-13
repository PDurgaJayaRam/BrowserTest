import axios from 'axios';
import cheerio from 'cheerio';
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
        timeout: 30000, // 30 second timeout for HTTP
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      const html = response.data;
      result.metadata.title = this.extractTitle(html);
      result.metadata.url = response.request.res.responseUrl || url;

      // Extract text content for LLM
      const $ = cheerio.load(html);
      const textContent = $('body').text().trim().substring(0, 5000);

      if (selectors && selectors.length > 0) {
        result.data = this.extractWithSelectors(html, selectors);
      } else if (instructions) {
        // Direct LLM call with shorter timeout
        try {
          result.data = await nvidiaClient.generateCompletion(
            `Extract: ${instructions}\n\nContent:\n${textContent}`,
            'Extract accurately.',
            { maxTokens: 500, temperature: 0.5 }
          );
        } catch (aiError) {
          result.data = { fallback_text: textContent.substring(0, 300), ai_error: aiError.message };
        }
      } else {
        result.data = { extracted: textContent.substring(0, 300) };
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
    console.log(`AI Scrape called with query: ${query}, maxPages: ${maxPages}`);
    
    // Fallback search queries without API
    const searchQueries = [
      `${query}`,
      `${query} jobs`,
      `${query.replace(' ', '+')}+jobs`
    ].slice(0, maxPages);

    const allResults = [];

    for (const searchQuery of searchQueries) {
      try {
        console.log(`Searching: ${searchQuery}`);
        
        // Use DuckDuckGo HTML search with short timeout
        const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
        
        const response = await axios.get(searchUrl, {
          timeout: 20000, // 20 second timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml'
          }
        });

        console.log(`DuckDuckGo response status: ${response.status}`);
        
        const $ = cheerio.load(response.data);
        const results = [];

        // Extract search results - DuckDuckGo structure
        $('.result__title a, .result__a, a[data-testid="result-title-a"]').each((i, link) => {
          if (i < 10) {
            const href = $(link).attr('href');
            const title = $(link).text().trim();
            if (href && href.length > 10) {
              // Handle DuckDuckGo redirect URLs
              let finalUrl = href;
              if (href.includes('duckduckgo.com/l/?uddg=')) {
                const urlMatch = href.match(/uddg=([^&]+)/);
                if (urlMatch) finalUrl = decodeURIComponent(urlMatch[1]);
              }
              results.push({ 
                title: title.substring(0, 200), 
                url: finalUrl 
              });
            }
          }
        });

        console.log(`Found ${results.length} results for: ${searchQuery}`);
        allResults.push(...results);
      } catch (error) {
        console.error(`Search error for ${searchQuery}:`, error.message);
      }
    }

    return allResults.slice(0, 20);
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