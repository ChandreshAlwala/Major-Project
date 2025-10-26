const fetch = require('node-fetch');

async function testRecommendation() {
  try {
    const response = await fetch('http://localhost:8000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredients: ['chicken', 'rice']
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    // Log the raw data without truncation
    console.log('Recommendations count:', data.recommendations?.length || 0);
    
    if (data.recommendations && data.recommendations.length > 0) {
      const firstRec = data.recommendations[0];
      console.log('\nFirst recommendation keys:', Object.keys(firstRec));
      console.log('Has recipe property:', 'recipe' in firstRec);
      console.log('Recipe property type:', typeof firstRec.recipe);
      
      if (firstRec.recipe) {
        console.log('Recipe keys:', Object.keys(firstRec.recipe));
        console.log('Recipe title:', firstRec.recipe.title);
        console.log('Recipe image URL:', firstRec.recipe.imageUrl);
      }
      
      // Log a small part of the full response
      console.log('\nFirst recommendation (partial):');
      console.log(JSON.stringify({
        id: firstRec.id,
        score: firstRec.score,
        recipe: firstRec.recipe ? {
          title: firstRec.recipe.title,
          imageUrl: firstRec.recipe.imageUrl
        } : null
      }, null, 2));
    } else {
      console.log('No recommendations found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRecommendation();