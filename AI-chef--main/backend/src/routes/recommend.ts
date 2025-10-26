import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { LLMService } from '../services/llm';

const recommendSchema = z.object({
  userId: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  timeLimit: z.number().optional(),
  diet: z.string().optional(),
  cuisine: z.string().optional(),
  servings: z.number().optional(),
});

export default async function recommendRoutes(fastify: FastifyInstance) {
  const llmService = new LLMService();

  fastify.post('/recommend', {
    preHandler: fastify.auth([fastify.authenticate], { optional: true }),
    schema: {
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          ingredients: { type: 'array', items: { type: 'string' } },
          timeLimit: { type: 'number' },
          diet: { type: 'string' },
          cuisine: { type: 'string' },
          servings: { type: 'number' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  score: { type: 'number' },
                  reason: { type: 'string' },
                  modifications: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const body = recommendSchema.parse(request.body);
    const userId = body.userId || (request as any).user?.userId;

    // Check if Redis is available for rate limiting
    if (fastify.redis) {
      // Rate limiting
      const clientIp = request.ip;
      const cacheKey = `rate_limit:${clientIp}`;
      const currentCount = await fastify.redis.incr(cacheKey);
      if (currentCount === 1) {
        await fastify.redis.expire(cacheKey, 60); // 1 minute
      }
      if (currentCount > 10) { // 10 requests per minute
        return reply.code(429).send({ error: 'Rate limit exceeded' });
      }
    }

    // Get user preferences if logged in
    let userPreferences = null;
    if (userId) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });
      userPreferences = user?.preferences;
    }

    // Merge user preferences with request
    const context = {
      ingredients: body.ingredients || [],
      timeLimit: body.timeLimit,
      diet: body.diet || userPreferences?.diet,
      cuisine: body.cuisine || userPreferences?.cuisine,
      servings: body.servings,
      allergies: userPreferences?.allergies || [],
    };

    // Check if Redis is available for caching
    if (fastify.redis) {
      // Cache key for recommendations
      const contextHash = JSON.stringify(context);
      const cacheKeyRec = `recommend:${Buffer.from(contextHash).toString('base64')}`;
      const cached = await fastify.redis.get(cacheKeyRec);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // Prefilter recipes based on hard constraints
    const where: any = {};

    if (context.timeLimit) {
      where.totalTime = { lte: context.timeLimit };
    }

    if (context.cuisine) {
      where.cuisine = { equals: context.cuisine };
    }

    if (context.diet) {
      // Since tags is stored as JSON string, we need to use contains
      where.tags = { contains: context.diet };
    }

    // Exclude recipes with allergens
    if (context.allergies && context.allergies.length > 0) {
      // This is simplified; in reality, you'd need to check ingredients
      // For now, assume allergens might be in tags
      // We can't easily exclude with JSON string, so we'll handle this in the LLM
    }

    // Get all recipes for better matching (remove prefiltering that might exclude relevant recipes)
    const candidateRecipes = await (fastify as any).prisma.recipe.findMany({
      take: 100, // Get more recipes for better matching
      orderBy: { createdAt: 'desc' }, // Add consistent ordering
      select: {
        id: true,
        title: true,
        mainIngredients: true, // This is what we need for ingredient matching
        ingredients: true, // Add full ingredients list for better matching
        cookTime: true,
        difficulty: true,
        tags: true,
        cuisine: true, // Add this to enable cuisine matching
        imageUrl: true, // Include image URL for recommendations
      },
    });

    // Log for debugging
    console.log('Candidate recipes count:', candidateRecipes.length);
    console.log('Context:', context);
    
    // Log specific recipe if it's in candidates
    const butterChicken = candidateRecipes.find((r: any) => r.id === 'cmge4effx000k9ye516q9awdw');
    if (butterChicken) {
      console.log('Butter Chicken found in candidates:', butterChicken);
    } else {
      console.log('Butter Chicken NOT found in candidates');
      // Let's see what recipes are being considered
      console.log('First 5 candidate recipes:', candidateRecipes.slice(0, 5));
    }

    // If no candidates, return empty
    if (candidateRecipes.length === 0) {
      return { recommendations: [] };
    }

    // Call LLM service
    const recommendations = await llmService.recommend(candidateRecipes, context);

    // Log recommendations for debugging
    console.log('Recommendations:', recommendations);

    // Store feedback if user provided
    if (userId && recommendations.length > 0 && fastify.prisma) {
      for (const rec of recommendations) {
        await fastify.prisma.feedback.create({
          data: {
            userId,
            context: context,
            recommendedRecipeId: rec.id,
            accepted: true, // Assume accepted for now
            reason: rec.reason,
          },
        });
      }
    }

    // Cache result if Redis is available
    if (fastify.redis) {
      const contextHash = JSON.stringify(context);
      const cacheKeyRec = `recommend:${Buffer.from(contextHash).toString('base64')}`;
      await fastify.redis.setex(cacheKeyRec, 3600, JSON.stringify({ recommendations })); // 1 hour
    }

    return { recommendations };
  });
}