const fs = require('fs');
const path = require('path');

// Mapping of recipe names to their original image paths
const recipeImageMapping = {
  'Aloo Gobi': '../../../AI-chef--main/Aloo Gobi.jpg',
  'Butter Chicken': '../../../AI-chef--main/Butter Chicken.webp',
  'Chana Masala': '../../../AI-chef--main/Chana Masala.jpg',
  'Chicken Biryani': '../../../AI-chef--main/Chicken Biryani.webp',
  'Dal Tadka': '../../../AI-chef--main/Dal Tadka.jpg',
  'Dosa': '../../../AI-chef--main/Dosa.webp',
  'Gulab Jamun': '../../../AI-chef--main/Gulab Jamun.jpg',
  'Hyderabadi Biryani': '../../../AI-chef--main/Hydrebadi Biryani.jpeg',
  'Kheer': '../../../AI-chef--main/Kheer.jpg',
  'Litti Chokha': '../../../AI-chef--main/Litti Choka.jpg',
  // New images
  'Malai Kofta': '../../../AI-chef--main/Malai Kofta.jpeg',
  'Palak Paneer': '../../../AI-chef--main/Palak Paneer.jpeg',
  'Pani Puri': '../../../AI-chef--main/Pani Puri.jpeg',
  'Pav Bhaji': '../../../AI-chef--main/Pav Bhaji.webp',
  'Prawn Curry': '../../../AI-chef--main/Prawn Curry.jpg',
  'Rajma': '../../../AI-chef--main/Rajma.jpeg',
  'Rogan Josh': '../../../AI-chef--main/Rogan Josh.jpg',
  'Samosa': '../../../AI-chef--main/Samosa.jpeg',
  'Vegetable Korma': '../../../AI-chef--main/Vegetable Korma.jpeg',
  'Vindaloo': '../../../AI-chef--main/Vindaloo.jpg'
};

// Function to convert recipe title to filename format
function titleToFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
}

console.log('Setting up original images...');

// Create images directory if it doesn't exist
const imageDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

let copiedCount = 0;
let errorCount = 0;

// Process each recipe image
for (const [recipeName, imagePath] of Object.entries(recipeImageMapping)) {
  try {
    // Full path to the source image
    const sourcePath = path.join(__dirname, imagePath);
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`✗ Source file not found: ${sourcePath}`);
      errorCount++;
      continue;
    }
    
    // Generate destination filename
    const baseName = titleToFilename(recipeName);
    const extension = path.extname(sourcePath);
    const destFileName = `${baseName}-local${extension}`;
    const destPath = path.join(imageDir, destFileName);
    
    // Copy the file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied ${recipeName} image to: ${destPath}`);
    copiedCount++;
  } catch (error) {
    console.log(`✗ Error copying ${recipeName} image: ${error.message}`);
    errorCount++;
  }
}

console.log(`\nResults:`);
console.log(`- Successfully copied: ${copiedCount} images`);
console.log(`- Errors: ${errorCount} images`);