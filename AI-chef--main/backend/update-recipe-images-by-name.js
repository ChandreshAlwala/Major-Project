const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to convert recipe title to filename format
function titleToFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
}

// Function to generate Unsplash image URL
function generateUnsplashUrl(searchTerm) {
  const width = 600;
  const height = 400;
  const seed = searchTerm.replace(/\s+/g, '-').toLowerCase();
  return `https://source.unsplash.com/${width}x${height}/?${searchTerm.replace(/\s+/g, ',')}&${seed}`;
}

// Function to check if we should use a local image for a recipe
function shouldUseLocalImage(title) {
  // These are the recipes for which we have local images
  const recipesWithLocalImages = [
    'aloo gobi', 'butter chicken', 'chana masala', 'chicken biryani', 
    'dal tadka', 'dosa', 'gulab jamun', 'hyderabadi biryani', 
    'kheer', 'litti chokha', 'malai kofta', 'palak paneer',
    'pani puri', 'pav bhaji', 'prawn curry', 'rajma',
    'rogan josh', 'samosa', 'vegetable korma', 'vindaloo'
  ];
  
  return recipesWithLocalImages.includes(title.toLowerCase());
}

// Function to get the local image URL for a recipe (with correct path)
function getLocalImageUrl(title) {
  const baseName = titleToFilename(title);
  // We need to determine the extension of the copied file
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  // For the recipes we just copied, we know their extensions:
  const knownExtensions = {
    'aloo gobi': '.jpg',
    'butter chicken': '.webp',
    'chana masala': '.jpg',
    'chicken biryani': '.webp',
    'dal tadka': '.jpg',
    'dosa': '.webp',
    'gulab jamun': '.jpg',
    'hyderabadi biryani': '.jpeg',
    'kheer': '.jpg',
    'litti chokha': '.jpg',
    'malai kofta': '.jpeg',
    'palak paneer': '.jpeg',
    'pani puri': '.jpeg',
    'pav bhaji': '.webp',
    'prawn curry': '.jpg',
    'rajma': '.jpeg',
    'rogan josh': '.jpg',
    'samosa': '.jpeg',
    'vegetable korma': '.jpeg',
    'vindaloo': '.jpg'
  };
  
  const ext = knownExtensions[title.toLowerCase()] || '.jpg';
  // Fix: Add leading slash to make it an absolute path
  return `/public/images/${baseName}-local${ext}`;
}

async function updateRecipeImagesByName() {
  console.log('Updating recipe images...');
  
  // Get all recipes
  const recipes = await prisma.recipe.findMany();
  
  console.log(`Found ${recipes.length} recipes in database`);
  
  let localImageCount = 0;
  let unsplashImageCount = 0;
  
  for (const recipe of recipes) {
    // Check if we should use a local image for this recipe
    if (shouldUseLocalImage(recipe.title)) {
      // Use local image
      const imageUrl = getLocalImageUrl(recipe.title);
      
      // Update the recipe with the local image URL
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: imageUrl }
      });
      
      console.log(`✓ Updated ${recipe.title} with local image: ${imageUrl}`);
      localImageCount++;
    } else {
      // Use Unsplash image
      const imageUrl = generateUnsplashUrl(recipe.title);
      
      // Update the recipe with the Unsplash image URL
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: imageUrl }
      });
      
      console.log(`✓ Updated ${recipe.title} with Unsplash image: ${imageUrl}`);
      unsplashImageCount++;
    }
  }
  
  console.log(`\nResults:`);
  console.log(`- Local images: ${localImageCount} recipes`);
  console.log(`- Unsplash images: ${unsplashImageCount} recipes`);
  console.log(`- Total processed: ${recipes.length} recipes`);
  
  await prisma.$disconnect();
}

// Run the function
updateRecipeImagesByName().catch(e => {
  console.error(e);
  process.exit(1);
});