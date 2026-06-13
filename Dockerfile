# Lightweight Dockerfile for Render Free Tier
# Uses axios + cheerio - no Chrome, no ESM issues

FROM node:18

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

# Start the server
CMD ["node", "src/server.js"]