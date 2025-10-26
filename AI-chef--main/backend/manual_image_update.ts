import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of recipe titles to local image URLs
const recipeImageMap = {
  'Aloo Gobi': '/public/images/aloo-gobi-local.jpg',
  'Butter Chicken': '/public/images/butter-chicken-local.webp',
  'Chana Masala': '/public/images/chana-masala-local.jpg',
  'Chicken Biryani': '/public/images/chicken-biryani-local.webp',
  'Dal Tadka': '/public/images/dal-tadka-local.jpg',
  'Dosa': '/public/images/dosa-local.webp',
  'Gulab Jamun': '/public/images/gulab-jamun-local.jpg',
  'Hyderabadi Biryani': '/public/images/hyderabadi-biryani-local.jpeg',
  'Kheer': '/public/images/kheer-local.jpg',
  'Litti Chokha': '/public/images/litti-chokha-local.jpg',
  'Malai Kofta': '/public/images/malai-kofta-local.jpeg',
  'Palak Paneer': '/public/images/palak-paneer-local.jpeg',
  'Pani Puri': '/public/images/pani-puri-local.jpeg',
  'Pav Bhaji': '/public/images/pav-bhaji-local.webp',
  'Prawn Curry': '/public/images/prawn-curry-local.jpg',
  'Rajma': '/public/images/rajma-local.jpeg',
  'Rogan Josh': '/public/images/rogan-josh-local.jpg',
  'Samosa': '/public/images/samosa-local.jpeg',
  'Vegetable Korma': '/public/images/vegetable-korma-local.jpeg',
  'Vindaloo': '/public/images/vindaloo-local.jpg',
  // Add more recipes as needed
};

async function updateRecipeImages() {
  console.log('Updating recipe images manually...');
  
  // Get all recipes
  const recipes = await prisma.recipe.findMany();
  
  let updatedCount = 0;
  
  for (const recipe of recipes) {
    // Check if we have a specific image for this recipe
    const imageUrl = recipeImageMap[recipe.title as keyof typeof recipeImageMap];
    
    if (imageUrl) {
      // Update the recipe with the specific image URL
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: imageUrl }
      });
      
      console.log(`Updated ${recipe.title} with image: ${imageUrl}`);
      updatedCount++;
    }
  }
  
  console.log(`\nSuccessfully updated ${updatedCount} recipes with manual images`);
  
  await prisma.$disconnect();
  // Use process.exit only if it's available
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(0);
  }
}

// Run the function
updateRecipeImages().catch(e => {
  console.error(e);
  // Use process.exit only if it's available
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
});