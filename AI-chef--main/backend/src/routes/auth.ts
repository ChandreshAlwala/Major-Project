import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Signup
  fastify.post('/signup', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string' }, // Remove format: 'email' to rely on Zod validation
          password: { type: 'string', minLength: 6 },
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
              required: ['id', 'name', 'email'],
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } }
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Validate the request body using Zod
      const { name, email, password } = signupSchema.parse(request.body);

      const existingUser = await fastify.prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return reply.code(400).send({ error: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await fastify.prisma.user.create({
        data: { name, email, passwordHash },
      });

      const accessToken = fastify.jwt.sign({ userId: user.id }, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '7d' });

      // Store refresh token
      await fastify.prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return reply.code(201).send({
        user: { id: user.id, name: user.name, email: user.email },
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        return reply.code(400).send({ 
          error: 'Invalid input data', 
          details: formattedErrors 
        });
      }
      
      // Handle other errors
      return reply.code(400).send({ 
        error: error.message || 'An error occurred during signup' 
      });
    }
  });

  // Login
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
              },
              required: ['id', 'name', 'email'],
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body);

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const accessToken = fastify.jwt.sign({ userId: user.id }, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '7d' });

    // Store refresh token
    await fastify.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return reply.send({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  });

  // Refresh token
  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as { userId: string };
      const session = await fastify.prisma.session.findUnique({ where: { refreshToken } });

      if (!session || session.expiresAt < new Date()) {
        return reply.code(401).send({ error: 'Invalid refresh token' });
      }

      const accessToken = fastify.jwt.sign({ userId: decoded.userId }, { expiresIn: '15m' });
      return reply.send({ accessToken });
    } catch (err) {
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }
  });
}