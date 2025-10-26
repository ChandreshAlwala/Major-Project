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
                  missingIngredients: { type: 'array', items: { type: 'string' } },
                  availableIngredients: { type: 'array', items: { type: 'string' } },
                  customizedInstructions: { type: 'string' },
                  recipe: {
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
                      sourceUrl: { type: ['string', 'null'] },
                      createdBy: { type: ['string', 'null'] },
                      mainIngredients: { type: 'string' },
                      createdAt: { type: 'string' }
                    }
                  }
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

    // Get user preferences if logged in
    let userPreferences = null;
    if (userId) {
      const user = await (fastify as any).prisma.user.findUnique({
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
        steps: true, // Include steps for customizing instructions
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

    // Enhance recommendations with full recipe data
    const enhancedRecommendations = await Promise.all(recommendations.map(async (rec: any) => {
      // If recipe data already exists, use it
      if (rec.recipe) {
        console.log(`Recipe data already exists for ${rec.id}:`, rec.recipe);
        return rec;
      }
      
      // Otherwise, fetch full recipe details
      try {
        const fullRecipe = await (fastify as any).prisma.recipe.findUnique({
          where: { id: rec.id }
        });
        
        console.log(`Recipe data fetched for ${rec.id}:`, fullRecipe);
        
        return {
          ...rec,
          recipe: fullRecipe
        };
      } catch (error) {
        console.error(`Error fetching recipe ${rec.id}:`, error);
        // Return the recommendation with minimal data if fetch fails
        return {
          ...rec,
          recipe: null
        };
      }
    }));

    // Store feedback if user provided
    if (userId && enhancedRecommendations.length > 0 && (fastify as any).prisma) {
      for (const rec of enhancedRecommendations) {
        await (fastify as any).prisma.feedback.create({
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

    console.log('Final response:', enhancedRecommendations);

    return { recommendations: enhancedRecommendations };
  });
}