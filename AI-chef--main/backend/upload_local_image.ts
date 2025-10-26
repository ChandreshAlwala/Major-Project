import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function uploadLocalImage() {
  try {
    console.log('Uploading local image for Prawn Curry recipe...');
    
    // Define paths
    const sourceImagePath = 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Prawn Curry.jpg';
    const destDir = path.join(__dirname, 'public', 'images');
    const destFileName = 'prawn-curry-local.jpg';
    const destImagePath = path.join(destDir, destFileName);
    
    // Ensure destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      console.log('Created images directory');
    }
    
    // Copy the image file
    fs.copyFileSync(sourceImagePath, destImagePath);
    console.log('Image copied to public/images directory');
    
    // Generate the URL for the image
    const imageUrl = `http://localhost:8000/public/images/${destFileName}`;
    
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
    
    // Update the recipe with the new image URL
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipe.id },
      data: { imageUrl: imageUrl }
    });
    
    console.log(`Updated recipe image URL to: ${updatedRecipe.imageUrl}`);
    console.log('Prawn Curry recipe image updated successfully!');
    
  } catch (error) {
    console.error('Error uploading local image:', error);
  } finally {
    await prisma.$disconnect();
  }
}

uploadLocalImage();