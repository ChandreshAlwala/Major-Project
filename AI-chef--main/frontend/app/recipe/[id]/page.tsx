'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChefHat, Clock, Users, Star, Heart, Share2, Printer } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [servings, setServings] = useState(1)
  const searchParams = useSearchParams()
  const customizedInstructions = searchParams.get('customizedInstructions')

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${params.id}`)
        const data = await response.json()
        
        if (response.ok) {
          setRecipe(data.recipe)
          setServings(data.recipe.servings)
        } else {
          setError(data.error || 'Failed to load recipe')
        }
      } catch (err) {
        setError('An error occurred while fetching the recipe')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <Link href="/search" className="btn-primary mt-4 inline-block">
            Back to Recipes
          </Link>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-2xl mb-4">Recipe Not Found</div>
          <Link href="/search" className="btn-primary">
            Back to Recipes
          </Link>
        </div>
      </div>
    )
  }

  // Parse JSON fields
  let ingredients = []
  let steps = []
  let tags = []
  let mainIngredients = []
  
  try {
    ingredients = JSON.parse(recipe.ingredients)
  } catch (e) {
    ingredients = []
  }
  
  try {
    steps = JSON.parse(recipe.steps)
  } catch (e) {
    steps = []
  }
  
  try {
    tags = JSON.parse(recipe.tags)
  } catch (e) {
    tags = []
  }
  
  try {
    mainIngredients = JSON.parse(recipe.mainIngredients)
  } catch (e) {
    mainIngredients = []
  }

  // Adjust ingredient quantities based on servings
  const adjustQuantity = (qty: number) => {
    return (qty * servings / recipe.servings).toFixed(2)
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
              <Link href="/recommend" className="text-gray-700 hover:text-orange-500">Get Recommendations</Link>
            </nav>
            <div className="flex space-x-4">
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/signup" className="btn-primary">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Recipe Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Recipe Header */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
                {recipe.description && (
                  <p className="mt-2 text-gray-600">{recipe.description}</p>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Printer className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Recipe Meta */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-1" />
                <span>{recipe.cookTime} mins</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-1" />
                <span>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                    className="w-16 border-b border-gray-300 text-center"
                  />{' '}
                  servings
                </span>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              <div className="text-gray-600 capitalize">{recipe.difficulty}</div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recipe Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ingredients */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Main Ingredients</h2>
                  <ul className="space-y-2">
                    {mainIngredients.map((ingredient: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="text-gray-700">• {ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">All Ingredients</h2>
                  <ul className="space-y-2">
                    {ingredients.map((ingredient: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <span className="text-gray-700">{ingredient.name}</span>
                        <span className="text-gray-900 font-medium">
                          {adjustQuantity(ingredient.qty)} {ingredient.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                
                {customizedInstructions ? (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Customized for Your Ingredients</h3>
                    <p className="text-blue-700 whitespace-pre-line">{customizedInstructions}</p>
                  </div>
                ) : null}
                
                <ol className="space-y-4">
                  {steps.map((step: string, index: number) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white font-medium mr-4">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}