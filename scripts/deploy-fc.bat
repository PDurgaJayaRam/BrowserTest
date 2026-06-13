@echo off
REM Alibaba Cloud Function Compute Deployment Script (Windows)

echo 🚀 Starting Alibaba Cloud deployment...

REM Check for Alibaba Cloud CLI
where aliyun >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Alibaba Cloud CLI not found. Please install it first.
    echo    Download from: https://github.com/alibabacloud/cli
    exit /b 1
)

REM Load environment variables
if exist "..\aliyun.env" (
    for /f "tokens=*" %%i in ('type "..\aliyun.env"') do set %%i
)

REM Check required variables
if "%ALIYUN_ACCESS_KEY_ID%"=="" (
    echo ❌ Need to set ALIYUN_ACCESS_KEY_ID
    exit /b 1
)

if "%ALIYUN_ACCESS_KEY_SECRET%"=="" (
    echo ❌ Need to set ALIYUN_ACCESS_KEY_SECRET
    exit /b 1
)

echo 📦 Building Docker image...
docker build -t nvidia-nim-scraper:latest -f Dockerfile.fc .

echo 📤 Pushing to Alibaba Container Registry...
docker tag nvidia-nim-scraper:latest %REGISTRY%.%ALIYUN_REGION%.aliyuncs.com/%NAMESPACE%/nvidia-nim-scraper:latest
docker push %REGISTRY%.%ALIYUN_REGION%.aliyuncs.com/%NAMESPACE%/nvidia-nim-scraper:latest

echo 🚀 Deploying to Container Service...
aliyun cs Deploy --template ..\aliyun-fc.yaml

echo ✅ Deployment complete!
echo 📝 Your scraper API is now available