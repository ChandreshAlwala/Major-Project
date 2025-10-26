const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

// Query to get all recipes and check for images
const query = `SELECT id, title, imageUrl FROM recipes ORDER BY title`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error querying database:', err);
    return;
  }

  console.log(`Total recipes: ${rows.length}`);
  
  // Count recipes with and without images
  let withImages = 0;
  let withoutImages = 0;
  
  rows.forEach(row => {
    if (row.imageUrl && row.imageUrl.trim() !== '') {
      withImages++;
    } else {
      withoutImages++;
    }
  });
  
  console.log(`Recipes with images: ${withImages}`);
  console.log(`Recipes without images: ${withoutImages}`);
  
  // Show some examples
  console.log('\n--- SAMPLE RECIPES WITH IMAGES ---');
  let shownWithImages = 0;
  rows.forEach(row => {
    if (row.imageUrl && row.imageUrl.trim() !== '' && shownWithImages < 3) {
      console.log(`${row.title}: ${row.imageUrl}`);
      shownWithImages++;
    }
  });
  
  console.log('\n--- SAMPLE RECIPES WITHOUT IMAGES ---');
  let shownWithoutImages = 0;
  rows.forEach(row => {
    if ((!row.imageUrl || row.imageUrl.trim() === '') && shownWithoutImages < 5) {
      console.log(row.title);
      shownWithoutImages++;
    }
  });
  
  // Close the database
  db.close();
});