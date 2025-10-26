import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// Define the recipe interface
interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  steps: string;
  cuisine: string;
  tags: string;
  cookTime: number;
  prepTime: number;
  totalTime: number;
  servings: number;
  difficulty: string;
  nutrition: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  createdBy: string | null;
  mainIngredients: string;
  createdAt: Date;
}

const searchQuerySchema = z.object({
  q: z.string().optional(),
  cuisine: z.string().optional(),
  diet: z.string().optional(),
  timeLimit: z.number().optional(),
  difficulty: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

const ratingSchema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export default async function recipeRoutes(fastify: FastifyInstance) {
  // Get recipes with search and filters
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          cuisine: { type: 'string' },
          diet: { type: 'string' },
          timeLimit: { type: 'number' },
          difficulty: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            recipes: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  ingredients: { type: 'string' },
                  steps: { type: 'string' },
                  cuisine: { type: 'string' },
                  tags: { type: 'string' },
                  cookTime: { type: 'number' },
                  prepTime: { type: 'number' },
                  totalTime: { type: 'number' },
                  servings: { type: 'number' },
                  difficulty: { type: 'string' },
                  nutrition: { type: 'string' },
                  imageUrl: { type: 'string' },
                  sourceUrl: { type: 'string' },
                  createdBy: { type: 'string' },
                  mainIngredients: { type: 'string' },
                  createdAt: { type: 'string' }
                }
              }
            },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { q, cuisine, diet, timeLimit, difficulty, page, limit } = searchQuerySchema.parse(request.query);

    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
    }

    if (cuisine) {
      where.cuisine = { contains: cuisine };
    }

    if (diet) {
      // Assuming diet is stored in tags or a separate field
      where.tags = { has: diet };
    }

    if (timeLimit) {
      where.totalTime = { lte: timeLimit };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const skip = (page - 1) * limit;
    const [recipes, total] = await Promise.all([
      (fastify as any).prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (fastify as any).prisma.recipe.count({ where }),
    ]);

    return { recipes, total, page, limit };
  });

  // Get single recipe
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // Add debugging
    console.log(`Fetching recipe with ID: ${id}`);
    
    const recipe = await (fastify as any).prisma.recipe.findUnique({
      where: { id },
    });
    
    // Add debugging
    console.log(`Recipe found:`, recipe);

    if (!recipe) {
      console.log(`Recipe not found for ID: ${id}`);
      return reply.code(404).send({ error: 'Recipe not found' });
    }

    const ratings = await (fastify as any).prisma.rating.findMany({
      where: { recipeId: id },
      include: { user: { select: { name: true } } },
    });

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.score, 0) / ratings.length
      : 0;

    // Create a proper recipe object to return
    const recipeResponse = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cuisine: recipe.cuisine,
      tags: recipe.tags,
      cookTime: recipe.cookTime,
      prepTime: recipe.prepTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      nutrition: recipe.nutrition,
      imageUrl: recipe.imageUrl,
      sourceUrl: recipe.sourceUrl,
      createdBy: recipe.createdBy,
      mainIngredients: recipe.mainIngredients,
      createdAt: recipe.createdAt
    };

    // Return the complete response
    return { 
      recipe: recipeResponse,
      ratings, 
      averageRating 
    };
  });

  // Rate recipe (authenticated)
  fastify.post('/:id/rate', {
    preHandler: (fastify as any).auth([(fastify as any).authenticate]),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['score'],
        properties: {
          score: { type: 'number', minimum: 1, maximum: 5 },
          comment: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { score, comment } = ratingSchema.parse(request.body);
    const userId = (request as any).user.userId;

    const recipe = await (fastify as any).prisma.recipe.findUnique({ where: { id } });
    if (!recipe) {
      return reply.code(404).send({ error: 'Recipe not found' });
    }

    const rating = await (fastify as any).prisma.rating.upsert({
      where: { userId_recipeId: { userId, recipeId: id } },
      update: { score, comment },
      create: { userId, recipeId: id, score, comment },
    });

    return rating;
  });

  // Save/unsave recipe (authenticated)
  fastify.post('/:id/save', {
    preHandler: (fastify as any).auth([(fastify as any).authenticate]),
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = (request as any).user.userId;

    const existing = await (fastify as any).prisma.savedRecipe.findUnique({
      where: { userId_recipeId: { userId, recipeId: id } },
    });

    if (existing) {
      await (fastify as any).prisma.savedRecipe.delete({ where: { id: existing.id } });
      return { saved: false };
    } else {
      await (fastify as any).prisma.savedRecipe.create({ data: { userId, recipeId: id } });
      return { saved: true };
    }
  });
}