import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Map of recipe names to image file paths (using actual existing files)
const recipeImageMap = {
  'Aloo Gobi': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Aloo Gobi.jpg',
  'Butter Chicken': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Butter Chicken.webp',
  'Chana Masala': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Chana Masala.jpg',
  'Chicken Biryani': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Chicken Biryani.webp',
  'Dal Tadka': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Dal Tadka.jpg',
  'Dosa': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Dosa.webp',
  'Gulab Jamun': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Gulab Jamun.jpg',
  'Hyderabadi Biryani': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Hydrebadi Biryani.jpeg',
  'Kheer': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Kheer.jpg',
  'Litti Chokha': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Litti Choka.jpg',
  'Malai Kofta': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Malai Kofta.jpeg',
  'Palak Paneer': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Palak Paneer.jpeg',
  'Pani Puri': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Pani Puri.jpeg',
  'Pav Bhaji': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Pav Bhaji.webp',
  'Prawn Curry': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Prawn Curry.jpg',
  'Rajma': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Rajma.jpeg',
  'Rogan Josh': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Rogan Josh.jpg',
  'Samosa': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Samosa.jpeg',
  'Vegetable Korma': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Vegetable Korma.jpeg',
  'Vindaloo': 'C:\\Users\\Acer Aspire 3\\Downloads\\AI-chef--main\\Vindaloo.jpg'
};

async function uploadMoreLocalImages() {
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
        
        // Generate destination file name (preserve extension)
        const ext = path.extname(imagePath);
        const fileName = `${recipeName.toLowerCase().replace(/\s+/g, '-')}-local${ext}`;
        const destImagePath = path.join(destDir, fileName);
        
        // Copy the image file
        fs.copyFileSync(imagePath, destImagePath);
        console.log(`Image copied for ${recipeName}`);
        
        // Generate the URL for the image (using full URL for proper frontend access)
        const imageUrl = `http://localhost:8000/public/images/${fileName}`;
        
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

uploadMoreLocalImages();