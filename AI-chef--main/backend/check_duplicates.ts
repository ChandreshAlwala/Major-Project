import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('Checking for duplicate recipes...');

  // Get all recipes from the database
  const allRecipes = await prisma.recipe.findMany({
    orderBy: {
      title: 'asc'
    }
  });

  console.log(`Total recipes in database: ${allRecipes.length}`);

  // Group recipes by title to find duplicates
  const recipesByTitle: { [key: string]: any[] } = {};

  allRecipes.forEach(recipe => {
    const title = recipe.title.toLowerCase().trim();
    if (!recipesByTitle[title]) {
      recipesByTitle[title] = [];
    }
    recipesByTitle[title].push(recipe);
  });

  // Find duplicates
  const duplicates: { [key: string]: any[] } = {};
  let duplicateCount = 0;

  Object.keys(recipesByTitle).forEach(title => {
    if (recipesByTitle[title].length > 1) {
      duplicates[title] = recipesByTitle[title];
      duplicateCount += recipesByTitle[title].length - 1; // Count extra copies
    }
  });

  console.log(`\nFound ${Object.keys(duplicates).length} unique recipes with duplicates`);
  console.log(`Total duplicate copies: ${duplicateCount}`);

  // Display duplicates
  if (Object.keys(duplicates).length > 0) {
    console.log('\n--- DUPLICATE RECIPES ---');
    Object.keys(duplicates).forEach(title => {
      console.log(`\nRecipe: ${title}`);
      duplicates[title].forEach((recipe, index) => {
        console.log(`  ${index + 1}. ID: ${recipe.id}`);
      });
    });
  } else {
    console.log('\nNo duplicates found!');
  }

  // Show all unique recipes
  console.log('\n--- ALL UNIQUE RECIPES ---');
  Object.keys(recipesByTitle).forEach(title => {
    console.log(`- ${recipesByTitle[title][0].title}`);
  });

  await prisma.$disconnect();
}

checkDuplicates().catch(e => {
  console.error(e);
  process.exit(1);
});