const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAlooGobi() {
  const recipe = await prisma.recipe.findFirst({
    where: {
      title: 'Aloo Gobi'
    }
  });
  
  if (recipe) {
    console.log('Aloo Gobi recipe found:');
    console.log('ID:', recipe.id);
    console.log('Title:', recipe.title);
    console.log('Image URL:', recipe.imageUrl);
  } else {
    console.log('Aloo Gobi recipe not found');
  }
  
  await prisma.$disconnect();
}

checkAlooGobi().catch(e => {
  console.error(e);
  process.exit(1);
});