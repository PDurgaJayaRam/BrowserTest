# Quick Start Guide for Render.com Deployment

## 🚀 Ready in 5 Minutes

### Step 1: Get Your NVIDIA NIM API Key

1. Go to [NVIDIA API Catalog](https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nim/apis)
2. Sign in or create an account
3. Get your API key (starts with `nvapi-`)

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 3: Deploy on Render.com

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Sign up (free) with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Use these settings:

| Field | Value |
|-------|-------|
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | Node |

### Step 4: Add Environment Variables

In Render dashboard, add:

| Key | Value | Secret? |
|-----|-------|---------|
| `NVIDIA_NIM_API_KEY` | Your API key | ✅ |
| `NVIDIA_NIM_BASE_URL` | `https://integrate.api.nvidia.com/v1` | |
| `NVIDIA_NIM_MODEL` | `llama-3.1-8b-instruct` | |
| `BROWSER_HEADLESS` | `true` | |

### Step 5: Test Your Deployment

```bash
# Health check
curl https://YOUR_SERVICE_NAME.onrender.com/health

# Scraper test
curl -X POST https://YOUR_SERVICE_NAME.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "instructions": "Extract page title"}'
```

## 💡 Tips

- Render free tier sleeps after 15 mins of inactivity
- First request after sleep takes ~10 seconds
- Use `/scrape/ai` for intelligent search-based scraping
- Monitor usage in Render dashboard