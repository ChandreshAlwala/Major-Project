const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the database
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

// Query to find the updated recipes
const recipesToCheck = ['Pav Bhaji', 'Rajma', 'Hyderabadi Biryani', 'Malai Kofta', 'Chicken Biryani'];

recipesToCheck.forEach(recipeName => {
  const query = `SELECT id, title, imageUrl FROM recipes WHERE title LIKE ?`;
  
  db.all(query, [`%${recipeName}%`], (err, rows) => {
    if (err) {
      console.error(`Error querying database for ${recipeName}:`, err);
      return;
    }
    
    if (rows.length === 0) {
      console.log(`${recipeName} recipe not found`);
    } else {
      rows.forEach(row => {
        console.log(`${row.title}: ${row.imageUrl}`);
      });
    }
  });
});

// Close the database after a short delay to allow queries to complete
setTimeout(() => {
  db.close();
}, 1000);