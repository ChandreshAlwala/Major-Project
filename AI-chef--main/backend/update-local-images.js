const { PrismaClient } = require('@prisma/client');

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
  // Additional recipes without specific images will use a generic pattern
  'Easy Chickpea Curry': '/public/images/chana-masala-local.jpg',
  'Classic Spaghetti Carbonara': '/public/images/pav-bhaji-local.webp',
  'Vegetable Stir Fry': '/public/images/vegetable-korma-local.jpeg',
  'Chocolate Chip Cookies': '/public/images/kheer-local.jpg',
  'Greek Salad': '/public/images/pani-puri-local.jpeg',
  'Beef Tacos': '/public/images/samosa-local.jpeg',
  'Mushroom Risotto': '/public/images/dal-tadka-local.jpg',
  'Honey Glazed Salmon': '/public/images/butter-chicken-local.webp',
  'Vegetable Lasagna': '/public/images/palak-paneer-local.jpeg',
  'Chicken Tikka Masala': '/public/images/butter-chicken-local.webp',
  'Quinoa Buddha Bowl': '/public/images/vegetable-korma-local.jpeg',
  'Beef Bourguignon': '/public/images/rogan-josh-local.jpg',
  'Shrimp Scampi': '/public/images/prawn-curry-local.jpg',
  'Pumpkin Soup': '/public/images/dal-tadka-local.jpg',
  'Beef and Broccoli Stir Fry': '/public/images/vegetable-korma-local.jpeg',
  'Caprese Stuffed Garlic Bread': '/public/images/pav-bhaji-local.webp'
};

async function updateRecipeImages() {
  console.log('Updating recipe images manually...');
  
  // Get all recipes
  const recipes = await prisma.recipe.findMany();
  
  let updatedCount = 0;
  
  for (const recipe of recipes) {
    // Check if we have a specific image for this recipe
    const imageUrl = recipeImageMap[recipe.title];
    
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
}

// Run the function
updateRecipeImages().catch(e => {
  console.error(e);
  process.exit(1);
});