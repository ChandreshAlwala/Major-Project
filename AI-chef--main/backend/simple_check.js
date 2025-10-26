const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

// Query to get all recipes
const query = `SELECT id, title FROM recipes ORDER BY title`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error querying database:', err);
    return;
  }

  console.log(`Total recipes: ${rows.length}`);
  
  // Group by title to find duplicates
  const recipesByTitle = {};
  
  rows.forEach(row => {
    const title = row.title.toLowerCase().trim();
    if (!recipesByTitle[title]) {
      recipesByTitle[title] = [];
    }
    recipesByTitle[title].push(row);
  });
  
  // Find duplicates
  const duplicates = {};
  let duplicateCount = 0;
  
  Object.keys(recipesByTitle).forEach(title => {
    if (recipesByTitle[title].length > 1) {
      duplicates[title] = recipesByTitle[title];
      duplicateCount += recipesByTitle[title].length - 1;
    }
  });
  
  console.log(`\nFound ${Object.keys(duplicates).length} unique recipes with duplicates`);
  console.log(`Total duplicate copies: ${duplicateCount}`);
  
  // Display duplicates
  if (Object.keys(duplicates).length > 0) {
    console.log('\n--- DUPLICATE RECIPES ---');
    Object.keys(duplicates).forEach(title => {
      console.log(`\nRecipe: ${recipesByTitle[title][0].title}`);
      duplicates[title].forEach((recipe, index) => {
        console.log(`  ${index + 1}. ID: ${recipe.id}`);
      });
    });
  } else {
    console.log('\nNo duplicates found!');
  }
  
  // Close the database
  db.close();
});