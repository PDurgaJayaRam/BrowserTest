# NVIDIA NIM + HTTP Scraper

**LIVE at:** https://browsertest-ujvg.onrender.com

## ✅ Service Status
Your scraper is **LIVE** and running on Render.com Free tier!

## Quick Test

```bash
# Health check
curl https://browsertest-ujvg.onrender.com/health

# Basic scrape (fallback mode - works without API key)
curl -X POST https://browsertest-ujvg.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","instructions":"Extract title"}'
```

## Features

- ✅ **HTTP Scraping** - Lightweight (axios + cheerio)
- ✅ **AI Extraction** - NVIDIA NIM integration (optional)
- ✅ **Fallback Mode** - Works without API key
- ✅ **Free Tier Ready** - Render.com compatible

## Configure NVIDIA NIM (Optional)

To enable AI-powered extraction with your NVIDIA API key:

1. Go to [Render Dashboard](https://dashboard.render.com/web/services/srv-d8mni50js32c73cth4bg)
2. Click **Environment** tab
3. Add:
   - **Key:** `NVIDIA_NIM_API_KEY`
   - **Value:** `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`
   - **Secret:** ✅ ON

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/scrape` | POST | Scrape with AI analysis |
| `/scrape/ai` | POST | AI-powered search |
| `/scrape/batch` | POST | Batch scraping |

## Troubleshooting

If you get 404 errors from NVIDIA API:
1. Check the model exists at NVIDIA NIM
2. Verify API key is correct
3. Try model: `deepseek-ai/deepseek-r1` or `meta/llama3-8b-instruct`

The scraper has **fallback mode** - it works even without NVIDIA API! 🚀