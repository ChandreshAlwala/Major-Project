import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Map of recipe names to image file paths
const recipeImageMap = {
  'Gulab Jamun': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Gulab Jamun.jpg',
  'Litti Chokha': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Litti Choka.jpg',
  'Kheer': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Kheer.jpg',
  'Vindaloo': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Vindaloo.jpg'
};

async function uploadMultipleLocalImages() {
  try {
    console.log('Uploading multiple local images for recipes...');
    
    // Ensure destination directory exists
    const destDir = path.join(__dirname, '..', 'public', 'images');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      console.log('Created images directory');
    }
    
    // Process each recipe
    for (const [recipeName, imagePath] of Object.entries(recipeImageMap)) {
      try {
        // Check if image file exists
        if (!fs.existsSync(imagePath)) {
          console.log(`Image file not found for ${recipeName}: ${imagePath}`);
          continue;
        }
        
        // Find the recipe
        const recipe = await prisma.recipe.findFirst({
          where: {
            title: {
              contains: recipeName
            }
          }
        });
        
        if (!recipe) {
          console.log(`${recipeName} recipe not found`);
          continue;
        }
        
        // Generate destination file name
        const fileName = `${recipeName.toLowerCase().replace(/\s+/g, '-')}-local.jpg`;
        const destImagePath = path.join(destDir, fileName);
        
        // Copy the image file
        fs.copyFileSync(imagePath, destImagePath);
        console.log(`Image copied for ${recipeName}`);
        
        // Generate the URL for the image
        const imageUrl = `/public/images/${fileName}`;
        
        // Update the recipe with the new image URL
        const updatedRecipe = await prisma.recipe.update({
          where: { id: recipe.id },
          data: { imageUrl: imageUrl }
        });
        
        console.log(`Updated ${recipeName} recipe image URL to: ${updatedRecipe.imageUrl}`);
      } catch (error) {
        console.error(`Error processing ${recipeName}:`, error);
      }
    }
    
    console.log('All recipe images processed!');
    
  } catch (error) {
    console.error('Error uploading local images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

uploadMultipleLocalImages();