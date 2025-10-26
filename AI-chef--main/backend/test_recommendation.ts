import axios from 'axios';

async function testRecommendation() {
  console.log('Testing recommendation API...\n');
  
  try {
    // Test the recommendation API
    const response = await axios.post('http://localhost:8000/api/recommend', {
      ingredients: ['chicken', 'rice', 'tomatoes'],
      cuisine: 'Italian',
      diet: 'vegetarian'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Recommendation API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // If we have recommendations, test fetching recipe details
    if (response.data.recommendations && response.data.recommendations.length > 0) {
      console.log('\nFetching recipe details...');
      const recipeIds = response.data.recommendations.map((rec: any) => rec.id).join(',');
      const recipeResponse = await axios.get(`http://localhost:8000/api/recipes?ids=${recipeIds}`);
      console.log('Recipe Details Response:');
      console.log(JSON.stringify(recipeResponse.data, null, 2));
    }
  } catch (error: any) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testRecommendation();