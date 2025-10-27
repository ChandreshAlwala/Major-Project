'use client'

import Link from 'next/link'
import { ChefHat, Clock, Users } from 'lucide-react'
import { useState } from 'react'

export default function RecommendPage() {
  const [ingredients, setIngredients] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [diet, setDiet] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Parse ingredients into an array
    const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(item => item.length > 0)
    
    // Prepare the request body
    const requestBody: any = {}
    if (ingredientsArray.length > 0) requestBody.ingredients = ingredientsArray
    if (timeLimit) requestBody.timeLimit = parseInt(timeLimit)
    if (diet) requestBody.diet = diet
    if (cuisine) requestBody.cuisine = cuisine
    
    console.log('Sending recommendation request:', requestBody);
    
    try {
      // Call the recommendation API
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      
      console.log('Recommendation response:', data);
      console.log('Recommendations array:', data.recommendations);
      if (data.recommendations && data.recommendations.length > 0) {
        console.log('First recommendation:', data.recommendations[0]);
        console.log('First recommendation recipe:', data.recommendations[0].recipe);
      }
      
      if (response.ok) {
        setRecommendations(data.recommendations || [])
      } else {
        setError(data.error || 'Failed to get recommendations')
        setRecommendations([])
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
      setError('An error occurred while getting recommendations')
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  // Function to encode customized instructions for URL
  const encodeCustomizedInstructions = (instructions: string) => {
    return encodeURIComponent(instructions);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">CooklyAI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-orange-500">Home</Link>
              <Link href="/search" className="text-gray-700 hover:text-orange-500">Recipes</Link>
              <Link href="/recommend" className="text-orange-500 font-medium">Get Recommendations</Link>
            </nav>
            <div className="flex space-x-4">
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/signup" className="btn-primary">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Recommendation Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Recipe Recommendations</h1>
            <p className="text-xl text-gray-600">
              Tell us what you have and what you want, and we&#39;ll find the perfect recipes for you
            </p>
          </div>

          <div className="card max-w-2xl mx-auto">
            <form onSubmit={handleRecommend}>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients you have
                  </label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="e.g., chicken, rice, tomatoes, cheese"
                    className="input w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate ingredients with commas
                  </p>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Cuisine
                  </label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Any cuisine</option>
                    <option value="Italian">Italian</option>
                    <option value="Indian">Indian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Mediterranean">Mediterranean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Preferences
                  </label>
                  <select
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">No specific diet</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-free</option>
                    <option value="dairy-free">Dairy-free</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      placeholder="e.g., 30"
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="input w-full"
                    >
                      <option value="">Any difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-lg"
                  >
                    {loading ? 'Finding Recipes...' : 'Get Recommendations'}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      {recommendations.length > 0 ? (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended For You</h2>
              <p className="text-gray-600">
                Based on your preferences, we think you&#39;ll love these recipes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.map((rec) => {
                // Parse JSON strings
                let ingredients = [];
                let mainIngredients = [];
                try {
                  ingredients = JSON.parse(rec.recipe?.ingredients || '[]');
                } catch (e) {
                  ingredients = [];
                }
                
                try {
                  mainIngredients = JSON.parse(rec.recipe?.mainIngredients || '[]');
                } catch (e) {
                  mainIngredients = [];
                }
                
                return (
                  <div key={rec.id} className="card">
                    <div className="h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                      {rec.recipe?.imageUrl ? (
                        <img 
                          src={rec.recipe.imageUrl} 
                          alt={rec.recipe?.title || 'Recipe'} 
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            // Fallback to chef hat icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6l8-4v16"/></svg>';
                            }
                          }}
                        />
                      ) : (
                        <ChefHat className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{rec.recipe?.title || 'Untitled Recipe'}</h3>
                    <p className="text-gray-600 text-sm mb-4 recipe-description">{rec.recipe?.description || 'No description available'}</p>
                    
                    {/* Show missing ingredients if any */}
                    {rec.missingIngredients && rec.missingIngredients.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-orange-600">
                          Missing: {rec.missingIngredients.join(', ')}
                        </p>
                      </div>
                    )}
                    
                    {/* Show main ingredients */}
                    {mainIngredients.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Main Ingredients:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {mainIngredients.slice(0, 3).map((ing: string, index: number) => (
                            <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                              {ing}
                            </span>
                          ))}
                          {mainIngredients.length > 3 && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              +{mainIngredients.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {rec.recipe?.cookTime || 0} min
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {rec.recipe?.servings || 0} servings
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <Link 
                        href={{
                          pathname: `/recipe/${rec.id}`,
                          query: rec.customizedInstructions ? { 
                            customizedInstructions: encodeCustomizedInstructions(rec.customizedInstructions) 
                          } : {}
                        }} 
                        className="btn-primary w-full text-center block"
                      >
                        View Recipe
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : !loading && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Recommendations Found</h2>
              <p className="text-gray-600 mb-8">
                We couldn&#39;t find any recipes matching your ingredients. Try adjusting your search terms.
              </p>
              <button 
                onClick={handleRecommend} 
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}