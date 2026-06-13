@echo off
echo Testing NVIDIA NIM Scraper on Render.com

echo.
echo 1. Health Check:
curl https://browsertest-ujvg.onrender.com/health

echo.
echo.
echo 2. Testing /scrape endpoint (will fail without API key in logs):
echo Note: This requires NVIDIA_NIM_API_KEY to be set in Render dashboard

echo.
echo 3. To manually test, run this in Linux/Mac terminal:
echo curl -X POST https://browsertest-ujvg.onrender.com/scrape -H "Content-Type: application/json" -d '{"url":"https://example.com","instructions":"Extract page title"}'
echo.
echo Or use Postman/Bruno with:
echo POST https://browsertest-ujvg.onrender.com/scrape
echo Headers: Content-Type: application/json
echo Body: {"url":"https://example.com","instructions":"Extract page title"}