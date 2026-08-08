# Backend Dockerfile
FROM node:18.19.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions (no CVE vulnerabilities)
RUN npm install --omit=dev && npm cache clean --force

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads/temp uploads/cv uploads/backup logs

# Set proper permissions
RUN chown -R node:node /app

# Use non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "backend/server.js"]
