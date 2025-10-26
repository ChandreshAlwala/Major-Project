const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLocalImages() {
  // Check a few recipes that should now have local images
  const recipesToCheck = [
    'Aloo Gobi',
    'Malai Kofta',
    'Palak Paneer',
    'Pani Puri',
    'Pav Bhaji',
    'Prawn Curry',
    'Rajma',
    'Rogan Josh',
    'Samosa',
    'Vegetable Korma',
    'Vindaloo'
  ];
  
  console.log('Checking recipes with local images:');
  
  for (const recipeName of recipesToCheck) {
    const recipe = await prisma.recipe.findFirst({
      where: {
        title: recipeName
      }
    });
    
    if (recipe) {
      console.log(`${recipeName}: ${recipe.imageUrl}`);
    } else {
      console.log(`${recipeName}: Not found`);
    }
  }
  
  await prisma.$disconnect();
}

checkLocalImages().catch(e => {
  console.error(e);
  process.exit(1);
});