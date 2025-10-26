import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const recipeUploadSchema = z.array(z.object({
  title: z.string(),
  description: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    qty: z.number(),
    unit: z.string(),
  })),
  steps: z.array(z.string()),
  cuisine: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cookTime: z.number(),
  prepTime: z.number(),
  servings: z.number(),
  difficulty: z.string(),
  nutrition: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
  }).optional(),
  imageUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
}));

export default async function adminRoutes(fastify: FastifyInstance) {
  // Upload recipes (CSV/JSON)
  fastify.post('/upload', {
    // TODO: Add admin authentication
    schema: {
      body: {
        type: 'array',
        items: {
          type: 'object',
          required: ['title', 'ingredients', 'steps', 'cookTime', 'prepTime', 'servings', 'difficulty'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name', 'qty', 'unit'],
                properties: {
                  name: { type: 'string' },
                  qty: { type: 'number' },
                  unit: { type: 'string' },
                },
              },
            },
            steps: { type: 'array', items: { type: 'string' } },
            cuisine: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            cookTime: { type: 'number' },
            prepTime: { type: 'number' },
            servings: { type: 'number' },
            difficulty: { type: 'string' },
            nutrition: {
              type: 'object',
              properties: {
                calories: { type: 'number' },
                protein: { type: 'number' },
                carbs: { type: 'number' },
                fat: { type: 'number' },
              },
            },
            imageUrl: { type: 'string' },
            sourceUrl: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const recipes = recipeUploadSchema.parse(request.body);

    const createdRecipes = [];
    for (const recipeData of recipes) {
      const recipe = await fastify.prisma.recipe.create({
        data: {
          ...recipeData,
          ingredients: JSON.stringify(recipeData.ingredients),
          steps: JSON.stringify(recipeData.steps),
          tags: JSON.stringify(recipeData.tags),
          nutrition: JSON.stringify(recipeData.nutrition),
          totalTime: recipeData.cookTime + recipeData.prepTime,
          mainIngredients: JSON.stringify(recipeData.ingredients.map(i => i.name)), // Derive main ingredients
        },
      });
      createdRecipes.push(recipe);
    }

    return { uploaded: createdRecipes.length, recipes: createdRecipes };
  });

  // Get analytics (simplified)
  fastify.get('/analytics', async (request, reply) => {
    const totalRecipes = await (fastify as any).prisma.recipe.count();
    const totalUsers = await (fastify as any).prisma.user.count();
    const totalRatings = await (fastify as any).prisma.rating.count();

    // Top recipes by ratings
    const topRecipes = await (fastify as any).prisma.recipe.findMany({
      take: 10,
      include: {
        _count: {
          select: { ratings: true },
        },
      },
      orderBy: {
        ratings: {
          _count: 'desc',
        },
      },
    });

    return {
      totalRecipes,
      totalUsers,
      totalRatings,
      topRecipes,
    };
  });

  // Upload recipe image (simplified - accepts image URL)
  fastify.post('/recipes/:id/image/upload', {
    preHandler: (fastify as any).auth([(fastify as any).authenticate]),
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { imageUrl } = request.body as { imageUrl: string };
    
    try {
      if (!imageUrl) {
        return reply.code(400).send({ error: 'No image URL provided' });
      }
      
      // Update recipe
      const recipe = await (fastify as any).prisma.recipe.update({
        where: { id },
        data: { imageUrl },
      });
      
      return recipe;
    } catch (error) {
      console.error('Error updating image:', error);
      return reply.code(500).send({ error: 'Failed to update image' });
    }
  });

  // Update recipe image
  fastify.put('/recipes/:id/image', {
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
        required: ['imageUrl'],
        properties: {
          imageUrl: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { imageUrl } = request.body as { imageUrl: string };
    
    try {
      const recipe = await (fastify as any).prisma.recipe.update({
        where: { id },
        data: { imageUrl },
      });
      
      return recipe;
    } catch (error) {
      return reply.code(500).send({ error: 'Failed to update recipe image' });
    }
  });

  // Bulk update recipe images
  fastify.put('/recipes/images/bulk', {
    preHandler: (fastify as any).auth([(fastify as any).authenticate]),
  }, async (request, reply) => {
    const { imageMap } = request.body as { imageMap: Record<string, string> };
    
    try {
      const updates = [];
      for (const [recipeId, imageUrl] of Object.entries(imageMap)) {
        updates.push(
          (fastify as any).prisma.recipe.update({
            where: { id: recipeId },
            data: { imageUrl },
          })
        );
      }
      
      await Promise.all(updates);
      
      return { message: 'All recipe images updated successfully' };
    } catch (error) {
      return reply.code(500).send({ error: 'Failed to update recipe images' });
    }
  });

}
