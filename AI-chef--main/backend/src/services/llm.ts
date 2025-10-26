import OpenAI from 'openai';

interface RecipeCandidate {
  id: string;
  title: string;
  mainIngredients: string | string[];
  ingredients: string | string[]; // Add full ingredients list
  cookTime: number;
  difficulty: string;
  tags: string | string[];
  cuisine?: string; // Add this missing property
  steps?: string | string[]; // Add steps property
}

interface RecommendationContext {
  ingredients: string[];
  timeLimit?: number;
  diet?: string;
  cuisine?: string;
  servings?: number;
  allergies: string[];
}

interface Recommendation {
  id: string;
  score: number;
  reason: string;
  modifications?: string[];
  // Add a field for customized instructions
  customizedInstructions?: string;
  // Add a field for missing ingredients
  missingIngredients?: string[];
  // Add a field for available ingredients
  availableIngredients?: string[];
  // Add recipe data
  recipe?: RecipeCandidate;
}

export class LLMService {
  private openai: OpenAI | null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } else {
      this.openai = null;
    }
  }

  async recommend(candidates: RecipeCandidate[], context: RecommendationContext): Promise<Recommendation[]> {
    if (this.openai) {
      return this.recommendWithLLM(candidates, context);
    } else {
      return this.recommendHeuristic(candidates, context);
    }
  }

  private async recommendWithLLM(candidates: RecipeCandidate[], context: RecommendationContext): Promise<Recommendation[]> {
    const compactCandidates = candidates.map(c => ({
      id: c.id,
      title: c.title,
      mainIngredients: c.mainIngredients,
      cookTime: c.cookTime,
      difficulty: c.difficulty,
      tags: c.tags,
      steps: c.steps,
    }));

    const systemPrompt = `You are a helpful recipe recommendation assistant. Given a user context (available ingredients, dietary restrictions, time limit, desired cuisine and servings), rank and score up to 7 recipe candidates from the provided list. Each candidate will be a concise JSON with keys: id, title, mainIngredients[], cookTime, difficulty, tags, steps[]. Return JSON array of objects {id, score:0-100, reason: 1-2 sentence, modifications: optional small ingredient swaps if needed}. Follow strict JSON only format in the output.`;

    // Enhanced prompt for ingredient-based recommendations
    const enhancedSystemPrompt = `You are a helpful recipe recommendation assistant. Given a user's available ingredients, recommend recipes that can be made with those ingredients. For each recipe, you should:
1. Score how well it matches the user's ingredients (higher score if more ingredients match)
2. Identify which ingredients the user has and which are missing
3. Rewrite the recipe instructions to skip steps that require missing ingredients
4. Provide modifications or substitutions where possible

Return a JSON array of objects with the following structure:
{
  "id": "recipe id",
  "score": 0-100 (higher if more ingredients match),
  "reason": "1-2 sentence explanation",
  "modifications": ["optional ingredient substitutions"],
  "missingIngredients": ["list of ingredients the user doesn't have"],
  "availableIngredients": ["list of ingredients the user has that are in this recipe"]
}

Focus on matching the user's ingredients with the recipe ingredients. A recipe that uses more of the user's ingredients should get a higher score.`;

    const userPrompt = `Context: ${JSON.stringify(context)}\n\nCandidates: ${JSON.stringify(compactCandidates)}`;

    try {
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid response format');
      }

      // Process the recommendations to add customized instructions
      const recommendationsWithInstructions = await Promise.all(parsed.slice(0, 7).map(async (rec: any) => {
        // Find the full recipe data
        const recipe = candidates.find(c => c.id === rec.id);
        if (recipe) {
          // Generate customized instructions based on available ingredients
          const customizedInstructions = await this.generateCustomizedInstructions(recipe, context.ingredients, rec.missingIngredients || []);
          
          return {
            id: rec.id,
            score: rec.score,
            reason: rec.reason,
            modifications: rec.modifications,
            missingIngredients: rec.missingIngredients || [],
            availableIngredients: rec.availableIngredients || [],
            customizedInstructions: customizedInstructions,
            recipe: recipe // Include the recipe data
          };
        }
        return {
          id: rec.id,
          score: rec.score,
          reason: rec.reason,
          modifications: rec.modifications,
          missingIngredients: rec.missingIngredients || [],
          availableIngredients: rec.availableIngredients || [],
          customizedInstructions: "Unable to customize instructions for this recipe.",
          recipe: undefined // No recipe data available
        };
      }));

      return recommendationsWithInstructions;
    } catch (error) {
      console.error('LLM recommendation failed:', error);
      return this.recommendHeuristic(candidates, context);
    }
  }

  // New method to generate customized instructions based on available ingredients
  private async generateCustomizedInstructions(recipe: RecipeCandidate, userIngredients: string[], missingIngredients: string[]): Promise<string> {
    if (!this.openai) {
      // Fallback for when OpenAI is not available
      return this.generateCustomizedInstructionsHeuristic(recipe, userIngredients, missingIngredients);
    }

    // Parse recipe steps
    let steps: string[] = [];
    try {
      if (typeof recipe.steps === 'string') {
        steps = JSON.parse(recipe.steps);
      }
    } catch (e) {
      console.error('Error parsing recipe steps:', e);
      return "Unable to customize instructions for this recipe.";
    }

    const systemPrompt = `You are a cooking assistant that specializes in modifying recipes based on available ingredients. Given a recipe and a list of missing ingredients, you will rewrite the instructions to skip steps that require those missing ingredients. Keep all other steps exactly as they are. If a step requires a missing ingredient, either skip that step entirely or suggest a substitution if appropriate.`;

    const userPrompt = `Recipe: ${recipe.title}
Ingredients the user has: ${userIngredients.join(', ')}
Ingredients the user is missing: ${missingIngredients.join(', ')}

Original steps:
${steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}

Please rewrite these instructions to skip steps that require missing ingredients. Number the steps sequentially and output only the modified steps, one per line.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return content;
    } catch (error) {
      console.error('Failed to generate customized instructions:', error);
      return this.generateCustomizedInstructionsHeuristic(recipe, userIngredients, missingIngredients);
    }
  }

  // Heuristic fallback for generating customized instructions
  private generateCustomizedInstructionsHeuristic(recipe: RecipeCandidate, userIngredients: string[], missingIngredients: string[]): string {
    // Parse recipe steps
    let steps: string[] = [];
    try {
      if (typeof recipe.steps === 'string') {
        steps = JSON.parse(recipe.steps);
      }
    } catch (e) {
      console.error('Error parsing recipe steps:', e);
      return "Unable to customize instructions for this recipe.";
    }

    // Simple heuristic: just note which ingredients are missing
    if (missingIngredients.length > 0) {
      const stepsText = steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n');
      return `Original recipe steps:\n${stepsText}\n\nNote: This recipe requires the following ingredients you don't have: ${missingIngredients.join(', ')}. Please consider substituting or purchasing these ingredients.`;
    } else {
      return steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n');
    }
  }

  private recommendHeuristic(candidates: RecipeCandidate[], context: RecommendationContext): Recommendation[] {
    // Filter candidates to only include recipes that contain ALL user ingredients
    const filteredCandidates = candidates.filter(r => {
      const overlap = this.countOverlapFromFullIngredients(r.ingredients, context.ingredients);
      return overlap === context.ingredients.length; // Recipe must contain all user ingredients
    });
    
    // If no recipes contain all ingredients, fall back to partial matching
    const useFiltered = filteredCandidates.length > 0;
    const finalCandidates = useFiltered ? filteredCandidates : candidates;
    
    return finalCandidates.map(r => {
      let score = 50; // Base score

      // Ingredient overlap - improved matching using full ingredients list
      const overlap = this.countOverlapFromFullIngredients(r.ingredients, context.ingredients);
      
      // For recipes with all ingredients, give maximum points for perfect overlap
      // For fallback recipes, use the previous scoring system
      if (useFiltered) {
        score += 50; // Bonus for having all ingredients
        // Additional points based on how many extra ingredients the recipe has
        if (Array.isArray(r.ingredients)) {
          const extraIngredients = r.ingredients.length - context.ingredients.length;
          // Prefer recipes with fewer extra ingredients
          score += Math.max(0, 20 - extraIngredients);
        }
      } else {
        // Original scoring for partial matches
        if (context.ingredients.length > 0) {
          const overlapRatio = overlap / context.ingredients.length;
          score += overlapRatio * 50; // Up to 50 points for overlap
        }
        
        // Also reward recipes that have a high percentage of their ingredients covered
        if (Array.isArray(r.ingredients)) {
          const recipeIngCount = r.ingredients.length;
          if (recipeIngCount > 0) {
            const coverageRatio = overlap / recipeIngCount;
            score += coverageRatio * 30; // Up to 30 points for high coverage
          }
        }
      }

      // Time penalty - less severe
      if (context.timeLimit && r.cookTime > context.timeLimit) {
        score -= Math.min(30, (r.cookTime - context.timeLimit));
      }

      // Diet compatibility
      if (context.diet) {
        const tagsArray = this.parseTags(r.tags);
        if (!tagsArray.includes(context.diet)) {
          score -= 15;
        }
      }

      // Cuisine match
      if (context.cuisine && r.cuisine) {
        if (r.cuisine.toLowerCase().includes(context.cuisine.toLowerCase()) || 
            context.cuisine.toLowerCase().includes(r.cuisine.toLowerCase())) {
          score += 25;
        }
      }

      // Allergies
      if (context.allergies && context.allergies.length > 0) {
        const tagsArray = this.parseTags(r.tags);
        if (context.allergies.some(allergen => tagsArray.includes(allergen))) {
          score -= 50;
        }
      }

      score = Math.max(0, Math.min(100, score));

      // Identify missing and available ingredients
      const recipeIngredients = this.parseIngredients(r.ingredients);
      const availableIngredients = recipeIngredients.filter(ing => 
        context.ingredients.some(userIng => 
          ing.toLowerCase().includes(userIng.toLowerCase()) || 
          userIng.toLowerCase().includes(ing.toLowerCase())
        )
      );
      
      const missingIngredients = recipeIngredients.filter(ing => 
        !availableIngredients.some(availableIng => 
          availableIng.toLowerCase() === ing.toLowerCase()
        )
      );

      const reasonDetail = useFiltered ? 
        `Recipe contains all ${context.ingredients.length} ingredients specified by user` : 
        `Heuristic match based on ingredients (${overlap} overlap) and constraints`;

      // Generate heuristic customized instructions
      let steps: string[] = [];
      try {
        if (typeof r.steps === 'string') {
          steps = JSON.parse(r.steps);
        }
      } catch (e) {
        console.error('Error parsing recipe steps:', e);
      }

      let customizedInstructions = "";
      if (missingIngredients.length > 0) {
        const stepsText = steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n');
        customizedInstructions = `Original recipe steps:\n${stepsText}\n\nNote: This recipe requires the following ingredients you don't have: ${missingIngredients.join(', ')}. Please consider substituting or purchasing these ingredients.`;
      } else {
        customizedInstructions = steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n');
      }

      // Include the recipe data in the recommendation
      return {
        id: r.id,
        score: Math.round(score),
        reason: `${reasonDetail}. Score: ${score}`,
        modifications: [],
        missingIngredients: missingIngredients,
        availableIngredients: availableIngredients,
        customizedInstructions: customizedInstructions,
        recipe: r // Include the recipe data
      };
    }).sort((a, b) => b.score - a.score).slice(0, 7);
  }

  private parseTags(tags: string | string[]): string[] {
    if (Array.isArray(tags)) {
      return tags;
    }
    
    if (typeof tags === 'string') {
      try {
        return JSON.parse(tags);
      } catch (e) {
        // If parsing fails, split by comma and trim
        return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
    }
    
    return [];
  }

  private countOverlap(recipeIngredients: string | string[], userIngredients: string[]): number {
    // Parse recipe ingredients properly
    let parsedRecipeIngredients: string[] = [];
    
    if (typeof recipeIngredients === 'string') {
      try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(recipeIngredients);
        if (Array.isArray(parsed)) {
          // If it's an array of objects with name property (like ingredients)
          if (parsed.length > 0 && typeof parsed[0] === 'object' && 'name' in parsed[0]) {
            parsedRecipeIngredients = parsed.map((ing: any) => ing.name.toLowerCase());
          } else {
            // If it's an array of strings (like mainIngredients)
            parsedRecipeIngredients = parsed.map((ing: string) => ing.toLowerCase());
          }
        } else {
          // If it's a simple string, split by comma
          parsedRecipeIngredients = recipeIngredients.split(',').map(i => i.trim().toLowerCase());
        }
      } catch (e) {
        // If JSON parsing fails, split by comma
        parsedRecipeIngredients = recipeIngredients.split(',').map(i => i.trim().toLowerCase());
      }
    } else if (Array.isArray(recipeIngredients)) {
      // If it's already an array
      if (recipeIngredients.length > 0 && typeof recipeIngredients[0] === 'object' && 'name' in recipeIngredients[0]) {
        parsedRecipeIngredients = recipeIngredients.map((ing: any) => ing.name.toLowerCase());
      } else {
        parsedRecipeIngredients = recipeIngredients.map((ing: string) => ing.toLowerCase());
      }
    }
    
    // Ensure userIngredients is an array and convert to lowercase
    const userArray = Array.isArray(userIngredients) ? userIngredients : [];
    const userLower = userArray.map(i => i.toLowerCase());
    
    // Count overlap - improved matching logic
    let overlapCount = 0;
    for (const userIng of userLower) {
      for (const recipeIng of parsedRecipeIngredients) {
        // Check for partial matches (e.g., "tomato" matches "tomatoes")
        if (userIng.includes(recipeIng) || recipeIng.includes(userIng)) {
          overlapCount++;
          break; // Count each user ingredient only once
        }
      }
    }
    
    return overlapCount;
  }

  // New function to count overlap using full ingredients list
  private countOverlapFromFullIngredients(recipeIngredients: string | string[], userIngredients: string[]): number {
    // Parse recipe ingredients properly
    let parsedRecipeIngredients: string[] = [];
    
    if (typeof recipeIngredients === 'string') {
      try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(recipeIngredients);
        if (Array.isArray(parsed)) {
          // If it's an array of objects with name property (like ingredients)
          if (parsed.length > 0 && typeof parsed[0] === 'object' && 'name' in parsed[0]) {
            parsedRecipeIngredients = parsed.map((ing: any) => ing.name.toLowerCase());
          } else {
            // If it's an array of strings
            parsedRecipeIngredients = parsed.map((ing: string) => ing.toLowerCase());
          }
        } else {
          // If it's a simple string, split by comma
          parsedRecipeIngredients = recipeIngredients.split(',').map(i => i.trim().toLowerCase());
        }
      } catch (e) {
        // If JSON parsing fails, split by comma
        parsedRecipeIngredients = recipeIngredients.split(',').map(i => i.trim().toLowerCase());
      }
    } else if (Array.isArray(recipeIngredients)) {
      // If it's already an array
      if (recipeIngredients.length > 0 && typeof recipeIngredients[0] === 'object' && 'name' in recipeIngredients[0]) {
        parsedRecipeIngredients = recipeIngredients.map((ing: any) => ing.name.toLowerCase());
      } else {
        parsedRecipeIngredients = recipeIngredients.map((ing: string) => ing.toLowerCase());
      }
    }
    
    // Ensure userIngredients is an array and convert to lowercase
    const userArray = Array.isArray(userIngredients) ? userIngredients : [];
    const userLower = userArray.map(i => i.toLowerCase());
    
    // Count overlap - improved matching logic with better partial matching
    let overlapCount = 0;
    for (const userIng of userLower) {
      for (const recipeIng of parsedRecipeIngredients) {
        // Normalize both strings for better matching
        const normalizedUserIng = userIng.replace(/[^a-zA-Z]/g, '');
        const normalizedRecipeIng = recipeIng.replace(/[^a-zA-Z]/g, '');
        
        // Check for partial matches with normalization
        if (normalizedUserIng.includes(normalizedRecipeIng) || 
            normalizedRecipeIng.includes(normalizedUserIng) ||
            this.fuzzyMatch(normalizedUserIng, normalizedRecipeIng)) {
          overlapCount++;
          break; // Count each user ingredient only once
        }
      }
    }
    
    return overlapCount;
  }

  // Helper function for fuzzy matching
  private fuzzyMatch(str1: string, str2: string): boolean {
    // Simple fuzzy matching for common variations
    const variations: { [key: string]: string[] } = {
      'tomato': ['tomatoes', 'tomato'],
      'potato': ['potatoes', 'potato'],
      'carrot': ['carrots', 'carrot'],
      'onion': ['onions', 'onion'],
      'garlic': ['garlics', 'garlic'],
      'cheese': ['cheeses', 'cheese']
    };
    
    // Check if either string is in the variations list of the other
    return str1.includes(str2) || str2.includes(str1) || 
           (variations[str1] && variations[str1].includes(str2)) || 
           (variations[str2] && variations[str2].includes(str1));
  }

  // Helper function to parse ingredients from various formats
  private parseIngredients(ingredients: string | string[]): string[] {
    let parsedIngredients: string[] = [];
    
    if (typeof ingredients === 'string') {
      try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(ingredients);
        if (Array.isArray(parsed)) {
          // If it's an array of objects with name property (like ingredients)
          if (parsed.length > 0 && typeof parsed[0] === 'object' && 'name' in parsed[0]) {
            parsedIngredients = parsed.map((ing: any) => ing.name);
          } else {
            // If it's an array of strings (like mainIngredients)
            parsedIngredients = parsed;
          }
        } else {
          // If it's a simple string, split by comma
          parsedIngredients = ingredients.split(',').map(i => i.trim());
        }
      } catch (e) {
        // If JSON parsing fails, split by comma
        parsedIngredients = ingredients.split(',').map(i => i.trim());
      }
    } else if (Array.isArray(ingredients)) {
      // If it's already an array
      if (ingredients.length > 0 && typeof ingredients[0] === 'object' && 'name' in ingredients[0]) {
        parsedIngredients = ingredients.map((ing: any) => ing.name);
      } else {
        parsedIngredients = ingredients;
      }
    }
    
    return parsedIngredients;
  }
}