const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

// Query to find the Prawn Curry recipe
const query = `SELECT id, title, imageUrl FROM recipes WHERE title LIKE '%Prawn Curry%' OR title LIKE '%Pran Curry%'`;

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error querying database:', err);
    return;
  }

  if (rows.length === 0) {
    console.log('Prawn Curry recipe not found');
    // Let's check all recipes to see what we have
    db.all(`SELECT id, title, imageUrl FROM recipes`, [], (err, allRows) => {
      if (err) {
        console.error('Error querying database:', err);
        return;
      }
      
      console.log('All recipes:');
      allRows.forEach(row => {
        if (row.title.includes('Prawn') || row.title.includes('Pran')) {
          console.log(`ID: ${row.id}, Title: ${row.title}, Image: ${row.imageUrl}`);
        }
      });
      
      db.close();
    });
  } else {
    console.log('Found Prawn Curry recipe(s):');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, Title: ${row.title}, Current Image: ${row.imageUrl}`);
    });
    db.close();
  }
});