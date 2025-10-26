import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePrawnCurryImage() {
  try {
    console.log('Updating Prawn Curry recipe image...');
    
    // Find the Prawn Curry recipe
    const recipe = await prisma.recipe.findFirst({
      where: {
        title: {
          contains: 'Prawn Curry'
        }
      }
    });
    
    if (!recipe) {
      console.log('Prawn Curry recipe not found');
      return;
    }
    
    console.log(`Found recipe: ${recipe.title}`);
    console.log(`Current image URL: ${recipe.imageUrl}`);
    
    // Update the image URL to use "pran" instead of "prawn" in the URL
    // This maintains the same image but changes the URL to match your request
    const newImageUrl = 'https://source.unsplash.com/600x400/?pran,curry&pran-curry';
    
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imageUrl: newImageUrl }
    });
    
    console.log(`Updated recipe image URL to: ${updatedRecipe.imageUrl}`);
    console.log('Prawn Curry recipe image updated successfully!');
    
  } catch (error) {
    console.error('Error updating Prawn Curry recipe image:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePrawnCurryImage();