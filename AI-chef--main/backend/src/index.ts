import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastifyAuth from '@fastify/auth';
import fastifyStatic from '@fastify/static'
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import pino from 'pino';
import path from 'path';

import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';
import recommendRoutes from './routes/recommend';
import adminRoutes from './routes/admin';

const logger = pino({ level: 'info' });

const fastify = Fastify({
  logger: {
    level: 'info',
  },
});

const prisma = new PrismaClient();
// Comment out Redis for now since we don't have it running
// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Register plugins
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret',
});

fastify.register(fastifyAuth); // Register the auth plugin

// Add authenticate function
fastify.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    // For optional authentication, we don't send an error
    // The route handler can check if the user is authenticated
    request.user = null;
  }
});

fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Swagger
fastify.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'CooklyAI API',
      description: 'API for AI-powered recipe recommendations',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});

fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// Decorate fastify with prisma
fastify.decorate('prisma', prisma);
// Comment out Redis decoration for now
// fastify.decorate('redis', redis);

// Register static file serving
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../public'),
  prefix: '/public/', // optional: default '/'
});

// Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(recipeRoutes, { prefix: '/api/recipes' });
fastify.register(recommendRoutes, { prefix: '/api' });
fastify.register(adminRoutes, { prefix: '/api/admin' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: parseInt(process.env.PORT || '8000'), host: '0.0.0.0' });
    console.log(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();