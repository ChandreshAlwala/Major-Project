#!/bin/bash

# CooklyAI Setup Script
echo "🚀 Setting up CooklyAI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker from https://www.docker.com"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start PostgreSQL and Redis
echo "🐳 Starting database and Redis..."
docker compose up db redis -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Setup backend
echo "🔧 Setting up backend..."
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To run the application:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "📱 Access the app:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"