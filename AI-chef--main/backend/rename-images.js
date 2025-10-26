const fs = require('fs');
const path = require('path');

// Function to convert recipe title to filename format
function titleToFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
}

// Get all files in the images directory
const imageDir = path.join(__dirname, 'public', 'images');
const files = fs.readdirSync(imageDir);

console.log('Renaming image files to follow naming convention...');

let renamedCount = 0;

// Process each file
for (const file of files) {
  // Skip if already follows the naming convention
  if (file.includes('-local.')) {
    continue;
  }
  
  // Get file extension
  const ext = path.extname(file);
  
  // Get base name without extension
  const baseName = path.basename(file, ext);
  
  // Convert to our naming convention
  const newBaseName = titleToFilename(baseName);
  const newFileName = `${newBaseName}-local${ext}`;
  const newFilePath = path.join(imageDir, newFileName);
  const oldFilePath = path.join(imageDir, file);
  
  // Rename the file
  try {
    fs.renameSync(oldFilePath, newFilePath);
    console.log(`Renamed: ${file} → ${newFileName}`);
    renamedCount++;
  } catch (err) {
    console.log(`Failed to rename: ${file}`);
  }
}

console.log(`\nRenamed ${renamedCount} files to follow naming convention.`);