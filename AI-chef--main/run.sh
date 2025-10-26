#!/bin/bash

# CooklyAI Run Script
echo "🚀 Starting CooklyAI..."

# Function to run backend
run_backend() {
    echo "🔧 Starting backend..."
    cd backend
    npm run dev
}

# Function to run frontend
run_frontend() {
    echo "🎨 Starting frontend..."
    cd frontend
    npm run dev
}

# Run both in background
run_backend &
BACKEND_PID=$!

run_frontend &
FRONTEND_PID=$!

echo "✅ Services started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait