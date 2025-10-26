const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('Removing duplicate recipes...');

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
  
  // Find duplicates and keep only the first occurrence
  let deletedCount = 0;
  
  Object.keys(recipesByTitle).forEach(title => {
    const recipes = recipesByTitle[title];
    if (recipes.length > 1) {
      // Keep the first recipe, delete the rest
      for (let i = 1; i < recipes.length; i++) {
        const recipeId = recipes[i].id;
        console.log(`Deleting duplicate: ${recipes[i].title} (ID: ${recipeId})`);
        
        // Delete the duplicate recipe
        db.run(`DELETE FROM recipes WHERE id = ?`, [recipeId], (err) => {
          if (err) {
            console.error('Error deleting recipe:', err);
          } else {
            deletedCount++;
          }
        });
      }
    }
  });
  
  // Wait a bit for all deletions to complete, then check the result
  setTimeout(() => {
    // Query again to get the updated count
    db.all(`SELECT id, title FROM recipes ORDER BY title`, [], (err, remainingRows) => {
      if (err) {
        console.error('Error querying database after deletion:', err);
        db.close();
        return;
      }
      
      console.log(`\nDeleted ${deletedCount} duplicate recipes`);
      console.log(`Remaining recipes: ${remainingRows.length}`);
      
      // Show all unique recipes
      console.log('\n--- UNIQUE RECIPES ---');
      remainingRows.forEach(row => {
        console.log(`- ${row.title}`);
      });
      
      db.close();
    });
  }, 2000);
});