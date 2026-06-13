# NVIDIA NIM + HTTP Scraper

A powerful web scraper built with NVIDIA NIM LLM API and HTTP fetching, deployed on Render.com.

## Features

- ✅ **AI-Powered Scraping** - Natural language instructions for data extraction
- ✅ **LLM Integration** - NVIDIA NIM for intelligent content analysis
- ✅ **HTTP Scraping** - Lightweight scraping with axios + cheerio
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
npm start
```

## Deploy to Render.com

Your code is already deployed! Just click **"Manual Deploy"** in Render dashboard.

### Environment Variables

| Variable | Value |
|----------|-------|
| `NVIDIA_NIM_API_KEY` | **Your secret API key** |
| `NVIDIA_NIM_BASE_URL` | `https://integrate.api.nvidia.com/v1` |
| `NVIDIA_NIM_MODEL` | `deepseek-ai/deepseek-v4-flash` |

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│   HTTP Client   │────▶│  Express API  │────▶│   NVIDIA NIM     │
└─────────────────┘     └──────────────┘     └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Web Page HTML   │
                    └──────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/scrape` | POST | Single page scrape with AI |
| `/scrape/ai` | POST | AI-powered search & scrape |
| `/scrape/batch` | POST | Batch processing |
| `/jobs/:jobId` | GET | Job status |

## Example Usage

### Health Check
```bash
curl https://browsertest-ujvg.onrender.com/health
```

### Basic Scrape
```bash
curl -X POST https://browsertest-ujvg.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "instructions": "Extract page title and main content"
  }'
```

### AI-Powered Search
```bash
curl -X POST https://browsertest-ujvg.onrender.com/scrape/ai \
  -H "Content-Type: application/json" \
  -d '{"query": "latest tech news", "maxPages": 3}'
```

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `NVIDIA_NIM_API_KEY` | Yes | - |
| `NVIDIA_NIM_MODEL` | No | `deepseek-ai/deepseek-v4-flash` |

## License

MIT