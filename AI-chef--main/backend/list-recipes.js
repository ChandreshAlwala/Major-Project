const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listRecipes() {
  const recipes = await prisma.recipe.findMany({
    select: {
      title: true
    }
  });
  
  console.log('Recipe titles:');
  recipes.forEach(recipe => {
    console.log(recipe.title);
  });
  
  await prisma.$disconnect();
}

listRecipes().catch(e => {
  console.error(e);
  process.exit(1);
});