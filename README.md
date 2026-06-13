# NVIDIA NIM + Puppeteer Scraper

A powerful web scraper built with NVIDIA NIM LLM API and Puppeteer, deployed on Render.com.

## Features

- ✅ **AI-Powered Scraping** - Natural language instructions for data extraction
- ✅ **LLM Integration** - NVIDIA NIM for intelligent content analysis
- ✅ **Browser Automation** - Real browser scraping with Puppeteer
- ✅ **Batch Processing** - Queue-based batch scraping
- ✅ **Serverless Ready** - Deploy to Render.com (Free Tier)
- ✅ **Container Ready** - Docker deployment

## Render.com Free Tier

Render offers a generous free tier perfect for this scraper:
- **750 hours/month** of free web service (enough for 24/7!)
- **Automatic HTTPS**
- **Custom domains**
- **Auto-deploys** from GitHub

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your NVIDIA NIM API key
```

### 3. Run Locally

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Deploy to Render.com

### Option A: One-Click Deploy (Recommended)

1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Set environment variables in Render dashboard (mark as secret for API key):

| Variable | Value |
|----------|-------|
| `NVIDIA_NIM_API_KEY` | Your NVIDIA API key |
| `NVIDIA_NIM_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_NIM_MODEL` | `llama-3.1-8b-instruct` |
| `BROWSER_HEADLESS` | `true` |

### Option B: Using render.yaml (Automatic)

1. Push your code to GitHub
2. Create a new **Blueprint** in Render
3. Select your repository
4. Render auto-detects `render.yaml` and creates the service

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│   HTTP Client   │────▶│  Express API  │────▶│   Puppeteer      │
└─────────────────┘     └──────────────┘     └──────────────────┘
                              │                        │
                              ▼                        ▼
                    ┌──────────────────┐     ┌──────────────────┐
                    │  NVIDIA NIM LLM  │     │  Chrome Headless   │
                    └──────────────────┘     └──────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/scrape` | POST | Single page scrape |
| `/scrape/ai` | POST | AI-powered search & scrape |
| `/scrape/batch` | POST | Batch processing |
| `/jobs/:jobId` | GET | Job status |

## Example Usage

### Basic Scrape
```bash
curl -X POST https://your-service.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "instructions": "Extract all product prices and names"
  }'
```

### AI-Powered Search
```bash
curl -X POST https://your-service.onrender.com/scrape/ai \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest tech news",
    "maxPages": 3
  }'
```

### Health Check
```bash
curl https://your-service.onrender.com/health
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NVIDIA_NIM_API_KEY` | Yes | - | NVIDIA API key |
| `NVIDIA_NIM_BASE_URL` | Yes | - | API endpoint |
| `NVIDIA_NIM_MODEL` | No | `deepseek-ai/deepseek-v4-flash` | LLM model |
| `BROWSER_HEADLESS` | No | `true` | Headless mode |
| `MAX_CONCURRENT_JOBS` | No | `2` | Concurrent jobs |

## Dependencies

- **puppeteer** - Browser automation
- **@ai-sdk/openai** - AI SDK for NVIDIA NIM
- **express** - Web framework
- **winston** - Structured logging

## License

MIT