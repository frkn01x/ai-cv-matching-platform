#!/bin/bash

# CV Application System - Setup Script

set -e

echo "================================"
echo "CV Application System Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Please edit .env file and configure all variables!${NC}"
    echo "Required configurations:"
    echo "  - Database credentials"
    echo "  - Redis password"
    echo "  - JWT secrets (generate secure random strings)"
    echo "  - OpenRouter API key"
    echo "  - Oracle Cloud credentials"
    echo "  - SMTP configuration"
    echo "  - VirusTotal API key"
    echo ""
    read -p "Press Enter to continue after configuring .env file..."
fi

echo -e "${GREEN}✓ .env file exists${NC}"
echo ""

# Create necessary directories
echo "Creating required directories..."
mkdir -p uploads/temp uploads/cv uploads/backup logs
mkdir -p nginx/ssl
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Build Docker images
echo "Building Docker images..."
docker-compose build
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

# Start services
echo "Starting services..."
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 15

# Check service health
echo "Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Services are running${NC}"
else
    echo -e "${RED}✗ Some services failed to start${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo "================================"
echo ""
echo "Application URLs:"
echo "  Frontend:  http://localhost:80"
echo "  Backend:   http://localhost:3000"
echo "  RabbitMQ:  http://localhost:15672"
echo ""
echo "Default admin credentials:"
echo "  Email:     admin@company.com"
echo "  Password:  Admin123!"
echo -e "${YELLOW}  ⚠ CHANGE THIS PASSWORD IMMEDIATELY!${NC}"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart services: docker-compose restart"
echo ""
echo "Next steps:"
echo "  1. Change the default admin password"
echo "  2. Test CV submission"
echo "  3. Configure SSL certificates for production"
echo "  4. Set up monitoring and alerts"
echo ""
