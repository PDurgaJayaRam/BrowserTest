# Lightweight Dockerfile for Render Free Tier
# Uses minimal dependencies (no full Chrome) - HTTP-based scraping with LLM

FROM node:18-alpine AS base

# Install minimal dependencies for HTTP fetching
RUN apk add --no-cache \
    bash \
    curl \
    ca-certificates \
    tzdata

WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src
COPY .env.example ./.env.example

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port (Render sets PORT env var)
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 10000) + '/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "src/server.js"]