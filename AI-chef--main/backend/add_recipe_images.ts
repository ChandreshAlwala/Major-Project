import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of recipe titles to search terms for finding relevant images
const recipeImageMap: { [key: string]: string } = {
  'Aloo Gobi': 'aloo gobi dish',
  'Beef Bourguignon': 'beef bourguignon',
  'Beef Tacos': 'beef tacos',
  'Beef and Broccoli Stir Fry': 'beef broccoli stir fry',
  'Butter Chicken': 'butter chicken',
  'Caprese Stuffed Garlic Bread': 'caprese garlic bread',
  'Chana Masala': 'chana masala',
  'Chicken Biryani': 'chicken biryani',
  'Chicken Tikka Masala': 'chicken tikka masala',
  'Chocolate Chip Cookies': 'chocolate chip cookies',
  'Classic Spaghetti Carbonara': 'spaghetti carbonara',
  'Dal Tadka': 'dal tadka',
  'Dosa': 'dosa indian',
  'Easy Chickpea Curry': 'chickpea curry',
  'Greek Salad': 'greek salad',
  'Gulab Jamun': 'gulab jamun',
  'Honey Glazed Salmon': 'honey glazed salmon',
  'Hyderabadi Biryani': 'hyderabadi biryani',
  'Kheer': 'kheer indian dessert',
  'Litti Chokha': 'litti chokha',
  'Malai Kofta': 'malai kofta',
  'Mushroom Risotto': 'mushroom risotto',
  'Palak Paneer': 'palak paneer',
  'Pani Puri': 'pani puri',
  'Pav Bhaji': 'pav bhaji',
  'Prawn Curry': 'prawn curry',
  'Pumpkin Soup': 'pumpkin soup',
  'Quinoa Buddha Bowl': 'quinoa buddha bowl',
  'Rajma': 'rajma curry',
  'Rogan Josh': 'rogan josh',
  'Samosa': 'samosa',
  'Shrimp Scampi': 'shrimp scampi',
  'Vegetable Korma': 'vegetable korma',
  'Vegetable Lasagna': 'vegetable lasagna',
  'Vegetable Stir Fry': 'vegetable stir fry',
  'Vindaloo': 'vindaloo'
};

// Function to generate Unsplash image URLs
function generateUnsplashUrl(searchTerm: string): string {
  // Using a consistent image size and a random seed for variety
  const width = 600;
  const height = 400;
  // Create a seed based on the recipe name for consistency
  const seed = searchTerm.replace(/\s+/g, '-').toLowerCase();
  return `https://source.unsplash.com/${width}x${height}/?${searchTerm.replace(/\s+/g, ',')}&${seed}`;
}

async function addRecipeImages() {
  console.log('Adding images to recipes...');
  
  // Get all recipes
  const recipes = await prisma.recipe.findMany();
  
  console.log(`Found ${recipes.length} recipes`);
  
  let updatedCount = 0;
  
  // Update each recipe with an image URL
  for (const recipe of recipes) {
    // Skip if recipe already has an image
    if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
      console.log(`Skipping ${recipe.title} - already has image`);
      continue;
    }
    
    // Get search term for this recipe
    const searchTerm = recipeImageMap[recipe.title] || recipe.title.toLowerCase();
    
    // Generate image URL
    const imageUrl = generateUnsplashUrl(searchTerm);
    
    // Update the recipe
    try {
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: imageUrl }
      });
      
      console.log(`Updated ${recipe.title} with image: ${imageUrl}`);
      updatedCount++;
    } catch (error) {
      console.error(`Error updating ${recipe.title}:`, error);
    }
  }
  
  console.log(`\nSuccessfully updated ${updatedCount} recipes with images`);
  
  // Verify the updates
  const recipesWithImages = await prisma.recipe.findMany({
    where: {
      imageUrl: {
        not: null
      }
    }
  });
  
  console.log(`\nTotal recipes with images: ${recipesWithImages.length}`);
  
  await prisma.$disconnect();
}

addRecipeImages().catch(e => {
  console.error(e);
  process.exit(1);
});