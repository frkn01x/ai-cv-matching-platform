# Build stage
FROM node:18.19.0-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:1.25.3-alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add security headers
RUN echo "add_header X-Frame-Options SAMEORIGIN always;" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header X-Content-Type-Options nosniff always;" >> /etc/nginx/conf.d/security.conf && \
    echo "add_header X-XSS-Protection '1; mode=block' always;" >> /etc/nginx/conf.d/security.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
