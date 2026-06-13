#!/bin/bash

# Alibaba Cloud Function Compute Deployment Script
# This script deploys the scraper to Alibaba Cloud Serverless

set -e

echo "🚀 Starting Alibaba Cloud deployment..."

# Load environment variables
if [ -f "../aliyun.env" ]; then
    source ../aliyun.env
fi

# Check required environment variables
: "${ALIYUN_ACCESS_KEY_ID:?Need to set ALIYUN_ACCESS_KEY_ID}"
: "${ALIYUN_ACCESS_KEY_SECRET:?Need to set ALIYUN_ACCESS_KEY_SECRET}"
: "${ALIYUN_REGION:?Need to set ALIYUN_REGION}"

# Login to Alibaba Cloud Container Registry
echo "📦 Logging in to Alibaba Cloud Container Registry..."
aliyun cr Build --region $ALIYUN_REGION --namespace $NAMESPACE --repo-name nvidia-nim-scraper

# Build and push Docker image
echo "🏗️ Building Docker image..."
docker build -t nvidia-nim-scraper:latest .

echo "📤 Pushing to registry ${REGISTRY}.${ALIYUN_REGION}.aliyuncs.com/${NAMESPACE}/nvidia-nim-scraper:latest..."
docker tag nvidia-nim-scraper:latest ${REGISTRY}.${ALIYUN_REGION}.aliyuncs.com/${NAMESPACE}/nvidia-nim-scraper:latest
docker push ${REGISTRY}.${ALIYUN_REGION}.aliyuncs.com/${NAMESPACE}/nvidia-nim-scraper:latest

# Deploy using Alibaba Cloud CLI
echo "🚀 Deploying to Container Service..."
aliyun cs Deploy --template ../aliyun-fc.yaml

echo "✅ Deployment complete!"
echo "📝 Your scraper API is now available"