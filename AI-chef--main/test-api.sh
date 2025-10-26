#!/bin/bash

# CooklyAI API Test Script
echo "🧪 Testing CooklyAI API..."

BASE_URL="http://localhost:8000"

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
if [ "$HEALTH_RESPONSE" -eq 200 ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed (HTTP $HEALTH_RESPONSE)"
    exit 1
fi

# Test signup
echo "Testing user signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }')

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Signup successful"
    ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ Signup failed: $SIGNUP_RESPONSE"
    exit 1
fi

# Test login
echo "Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Login successful"
else
    echo "❌ Login failed: $LOGIN_RESPONSE"
    exit 1
fi

# Test recipes endpoint
echo "Testing recipes endpoint..."
RECIPES_RESPONSE=$(curl -s "$BASE_URL/api/recipes")
if echo "$RECIPES_RESPONSE" | grep -q "recipes"; then
    echo "✅ Recipes endpoint working"
else
    echo "❌ Recipes endpoint failed: $RECIPES_RESPONSE"
    exit 1
fi

# Test recommendations endpoint
echo "Testing recommendations endpoint..."
RECOMMEND_RESPONSE=$(curl -s -X POST "$BASE_URL/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["chicken", "rice"],
    "timeLimit": 30
  }')

if echo "$RECOMMEND_RESPONSE" | grep -q "recommendations"; then
    echo "✅ Recommendations endpoint working"
else
    echo "❌ Recommendations endpoint failed: $RECOMMEND_RESPONSE"
    exit 1
fi

echo ""
echo "🎉 All API tests passed! CooklyAI is working correctly."
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"