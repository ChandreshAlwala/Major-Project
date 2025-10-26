'use client'

import Link from 'next/link'
import { ChefHat, Clock, Users, ChefHatIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRecipe()
  }, [params.id])

  const fetchRecipe = async () => {
    try {
      // Use the proxy path instead of direct URL
      const response = await fetch(`/api/recipes/${params.id}`)
      if (!response.ok) {
        throw new Error('Recipe not found')
      }
      const data = await response.json()
      setRecipe(data.recipe)
      setLoading(false)
    } catch (err) {
      setError('Failed to load recipe')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading recipe...</p>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
          <Link href="/search" className="btn-primary">
            Browse All Recipes
          </Link>
        </div>
      </div>
    )
  }

  // Parse JSON strings
  const ingredients = JSON.parse(recipe.ingredients)
  const steps = JSON.parse(recipe.steps)
  const nutrition = recipe.nutrition ? JSON.parse(recipe.nutrition) : null

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

      {/* Recipe Detail */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/search" className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-6">
            ← Back to Recipes
          </Link>

          <div className="card">
            <div className="h-64 rounded-md mb-6 overflow-hidden">
              {recipe.imageUrl ? (
                <img 
                  src={recipe.imageUrl} 
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to chef hat icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-16 w-16 text-gray-400"><path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1"/><path d="M19 15V6.5a1 1 0 0 0-7 0v11"/><path d="M2 14v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6"/><path d="M6 10V8a6 6 0 1 1 12 0v2"/></svg></div>';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ChefHatIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
            <p className="text-gray-600 mb-6">{recipe.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Cook Time</p>
                <p className="font-semibold">{recipe.cookTime} min</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Prep Time</p>
                <p className="font-semibold">{recipe.prepTime} min</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Users className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Servings</p>
                <p className="font-semibold">{recipe.servings}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <ChefHat className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="font-semibold capitalize">{recipe.difficulty}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
                <ul className="space-y-2">
                  {ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="flex items-center">
                      <input type="checkbox" className="mr-3 h-4 w-4 text-orange-500 rounded" />
                      <span>
                        {ingredient.qty} {ingredient.unit} {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Nutrition (per serving)</h2>
                {nutrition ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Calories</p>
                      <p className="font-semibold">{nutrition.calories}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Protein</p>
                      <p className="font-semibold">{nutrition.protein}g</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Carbs</p>
                      <p className="font-semibold">{nutrition.carbs}g</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">Fat</p>
                      <p className="font-semibold">{nutrition.fat}g</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Nutrition information not available</p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
              <ol className="space-y-4">
                {steps.map((step: string, index: number) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-orange-500 text-white mr-4">
                      {index + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="btn-primary w-full py-3">
                Save Recipe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}