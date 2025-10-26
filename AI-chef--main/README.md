# CooklyAI - AI-Powered Recipe Recommendation System

A full-stack web application that uses AI to provide personalized recipe recommendations based on user preferences, available ingredients, and dietary constraints.

## Features

- 🤖 **AI-Powered Recommendations**: Uses OpenAI GPT models to suggest recipes with explanations
- 🔍 **Smart Search & Filters**: Search by ingredients, cuisine, diet, cook time, and difficulty
- 👤 **User Authentication**: JWT-based auth with refresh tokens
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🛒 **Shopping Lists**: Generate and manage shopping lists from recipes
- ⭐ **Ratings & Feedback**: Rate recipes and provide feedback for AI improvement
- 📊 **Admin Panel**: Upload recipes, view analytics
- 🚀 **Production Ready**: Docker, CI/CD, monitoring, and deployment configs

## Tech Stack

### Frontend
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- React Query for state management
- Lucide React for icons

### Backend
- Node.js + TypeScript
- Fastify framework
- Prisma ORM with PostgreSQL
- Redis for caching
- OpenAI API integration
- JWT authentication

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Vercel (frontend) + Docker (backend) deployment

## Quick Start

### Prerequisites
- Node.js 18+ ([download here](https://nodejs.org))
- Docker Desktop ([download here](https://www.docker.com/products/docker-desktop))
- Git

**Important**: Make sure Docker Desktop is running before starting the setup.

### Automated Setup (Recommended)

1. **Clone and setup automatically**:
   ```bash
   git clone <your-repo-url>
   cd cooklyai
   ./setup.sh
   ```

2. **Run the application**:
   ```bash
   ./run.sh
   ```

That's it! The application will be running at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cooklyai
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults should work)
   ```

3. **Start Infrastructure**
   ```bash
   # Start PostgreSQL and Redis
   docker compose up db redis -d
   ```

4. **Setup Backend**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run prisma:seed
   npm run dev
   ```
   Backend runs on `http://localhost:8000`

5. **Setup Frontend** (in new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

### Docker Setup (Full Stack)

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Recipes
- `GET /api/recipes` - List recipes with filters
- `GET /api/recipes/:id` - Get recipe details
- `POST /api/recipes/:id/rate` - Rate a recipe
- `POST /api/recipes/:id/save` - Save/unsave recipe

### Recommendations
- `POST /api/recommend` - Get AI-powered recommendations

### Admin
- `POST /api/admin/upload` - Upload recipes (JSON/CSV)
- `GET /api/admin/analytics` - View analytics

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/cooklyai
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
REDIS_URL=redis://redis:6379
PORT=8000
OPENAI_API_KEY=your_openai_key  # Optional
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Database Schema

The application uses PostgreSQL with the following main entities:
- Users (with preferences)
- Recipes (with ingredients, steps, nutrition)
- Ratings & Feedback
- Saved Recipes
- Shopping Lists
- Sessions

## AI Integration

The recommendation engine uses OpenAI's GPT models with a custom prompt to rank recipes based on:
- Available ingredients
- Dietary restrictions
- Time constraints
- Cuisine preferences
- Serving size

If no OpenAI API key is provided, a heuristic fallback ranks recipes based on ingredient overlap and constraints.

## Testing

### API Tests
```bash
# Test all API endpoints
./test-api.sh
```

### Unit Tests
```bash
cd backend && npm test
cd frontend && npm test
```

### E2E Tests
```bash
cd frontend && npm run test:e2e
```

### CI/CD
GitHub Actions runs:
- Linting
- Unit tests
- Integration tests
- E2E tests
- Build checks

## Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy automatically on push to main

### Backend (Docker)
1. Build Docker image
2. Deploy to cloud provider (Render, Railway, etc.)
3. Set environment variables
4. Run database migrations

### Docker Compose (Full Stack)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Fastify       │
│   Frontend      │◄──►│   Backend API   │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   PostgreSQL    │
│   Deployment    │    │   Database      │
└─────────────────┘    └─────────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   Redis Cache   │
                └─────────────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   OpenAI API    │
                │   (Optional)    │
                └─────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues:
- Create an issue on GitHub
- Check the API documentation
- Review the troubleshooting guide

---

## Troubleshooting

### Frontend Issues

**"sh: next: command not found"**
```bash
cd frontend
npm install
```

**"Module not found" errors**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 already in use**
```bash
lsof -ti:3000 | xargs kill -9
```

### Backend Issues

**"sh: tsx: command not found"**
```bash
cd backend
npm install
```

**Database connection error**
```bash
# Make sure Docker is running
docker compose up db redis -d
sleep 10
cd backend
npx prisma migrate dev
```

**Port 8000 already in use**
```bash
lsof -ti:8000 | xargs kill -9
```

### Docker Issues

**"command not found: docker"**
- Install Docker Desktop from https://www.docker.com/products/docker-desktop
- Start Docker Desktop application

**Database won't start**
```bash
docker compose down
docker compose up db redis -d
```

### General Issues

**Permission denied on scripts**
```bash
chmod +x setup.sh run.sh test-api.sh
```

**Clean restart**
```bash
# Stop everything
docker compose down
pkill -f "next\|tsx\|node"

# Clean and restart
rm -rf backend/node_modules frontend/node_modules
./setup.sh
./run.sh
```

---

Built with ❤️ using modern web technologies.