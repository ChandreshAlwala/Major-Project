async function testRecommendations() {
  try {
    // Test the recommendation API with sample ingredients
    const response = await fetch('http://localhost:8000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ingredients: ['chicken', 'rice', 'tomatoes', 'onions'],
        timeLimit: 60,
        diet: 'none',
        cuisine: 'Indian'
      }),
    });

    const data = await response.json();
    console.log('Recommendation Response:', JSON.stringify(data, null, 2));
    
    if (data.recommendations && data.recommendations.length > 0) {
      console.log(`\nFound ${data.recommendations.length} recommendations:`);
      data.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. Recipe ID: ${rec.id}, Score: ${rec.score}`);
        console.log(`   Reason: ${rec.reason}`);
      });
    } else {
      console.log('No recommendations found');
    }
  } catch (error) {
    console.error('Error testing recommendations:', error);
  }
}

testRecommendations();