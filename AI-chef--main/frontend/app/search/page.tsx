'use client'

import Link from 'next/link'
import { Search, Clock, Users, ChefHat, Filter } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string
  cookTime: number
  prepTime: number
  servings: number
  difficulty: string
  cuisine: string
  tags: string
  imageUrl?: string
  mainIngredients?: string // Add mainIngredients property
}

export default function SearchPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('')
  const [selectedDiet, setSelectedDiet] = useState('both') // New state for diet filter

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      console.log('Fetching recipes from API...')
      // Use the proxy path instead of direct URL
      const response = await fetch('/api/recipes?limit=100')
      console.log('API response status:', response.status)
      const data = await response.json()
      console.log('API response data:', data)
      setRecipes(data.recipes)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching recipes:', error)
      setLoading(false)
    }
  }

  // Filter recipes based on search term, selected cuisine, and diet
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = searchTerm === '' || 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.parse(recipe.ingredients).some((ing: any) => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      
      const matchesCuisine = selectedCuisine === '' || 
        (recipe.cuisine && recipe.cuisine.toLowerCase() === selectedCuisine.toLowerCase())
      
      // Improved diet filter logic
      let matchesDiet = true
      if (selectedDiet !== 'both') {
        try {
          // First check tags for explicit diet indicators
          const tags = JSON.parse(recipe.tags)
          
          // Check for explicit vegetarian tags
          const hasVegetarianTag = tags.some((tag: string) => 
            ['vegetarian', 'vegan', 'plant-based'].includes(tag.toLowerCase())
          )
          
          // Check for explicit non-vegetarian tags
          const hasNonVegetarianTag = tags.some((tag: string) => 
            ['beef', 'chicken', 'pork', 'fish', 'seafood', 'meat', 'lamb', 'turkey', 'duck', 'non-vegetarian'].includes(tag.toLowerCase())
          )
          
          if (selectedDiet === 'veg') {
            // For vegetarian, prioritize explicit vegetarian tags
            // If no explicit tags, check for absence of meat ingredients
            if (hasVegetarianTag) {
              matchesDiet = true
            } else if (hasNonVegetarianTag) {
              matchesDiet = false
            } else {
              // Check ingredients for meat
              try {
                const ingredients = JSON.parse(recipe.ingredients)
                matchesDiet = !ingredients.some((ing: any) => {
                  const ingredientName = ing.name.toLowerCase()
                  return [
                    'beef', 'chicken', 'pork', 'fish', 'seafood', 'meat', 'lamb', 'turkey', 'duck',
                    'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'steak', 'ribs'
                  ].some(meat => ingredientName.includes(meat))
                })
              } catch (e) {
                matchesDiet = true // If parsing fails, assume it's okay
              }
            }
          } else if (selectedDiet === 'non-veg') {
            // For non-vegetarian, prioritize explicit non-vegetarian tags
            // If no explicit tags, check for presence of meat ingredients
            if (hasNonVegetarianTag) {
              matchesDiet = true
            } else if (hasVegetarianTag) {
              matchesDiet = false
            } else {
              // Check ingredients for meat
              try {
                const ingredients = JSON.parse(recipe.ingredients)
                matchesDiet = ingredients.some((ing: any) => {
                  const ingredientName = ing.name.toLowerCase()
                  return [
                    'beef', 'chicken', 'pork', 'fish', 'seafood', 'meat', 'lamb', 'turkey', 'duck',
                    'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'steak', 'ribs'
                  ].some(meat => ingredientName.includes(meat))
                })
              } catch (e) {
                matchesDiet = false // If parsing fails, assume it's not matching
              }
            }
          }
        } catch (e) {
          // If tags parsing fails, check ingredients for meat
          try {
            const ingredients = JSON.parse(recipe.ingredients)
            if (selectedDiet === 'veg') {
              matchesDiet = !ingredients.some((ing: any) => {
                const ingredientName = ing.name.toLowerCase()
                return [
                  'beef', 'chicken', 'pork', 'fish', 'seafood', 'meat', 'lamb', 'turkey', 'duck',
                  'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'steak', 'ribs'
                ].some(meat => ingredientName.includes(meat))
              })
            } else if (selectedDiet === 'non-veg') {
              matchesDiet = ingredients.some((ing: any) => {
                const ingredientName = ing.name.toLowerCase()
                return [
                  'beef', 'chicken', 'pork', 'fish', 'seafood', 'meat', 'lamb', 'turkey', 'duck',
                  'bacon', 'ham', 'sausage', 'pepperoni', 'salami', 'steak', 'ribs'
                ].some(meat => ingredientName.includes(meat))
              })
            }
          } catch (e2) {
            matchesDiet = true // If parsing fails, show all
          }
        }
      }
      
      return matchesSearch && matchesCuisine && matchesDiet
    })
  }, [recipes, searchTerm, selectedCuisine, selectedDiet])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCuisine(e.target.value)
  }

  // New handler for diet filter
  const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiet(e.target.value)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCuisine('')
    setSelectedDiet('both')
  }

  // Get unique cuisines from recipes
  const uniqueCuisines = Array.from(new Set(recipes.map(recipe => recipe.cuisine))).filter(Boolean)

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
              <Link href="/search" className="text-orange-500 font-medium">Recipes</Link>
              <Link href="/recommend" className="text-gray-700 hover:text-orange-500">Get Recommendations</Link>
            </nav>
            <div className="flex space-x-4">
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/signup" className="btn-primary">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Recipes</h1>
          
          <div className="mb-8">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by ingredients, cuisine, or recipe name..."
                className="input rounded-r-none w-full"
              />
              <button className="btn-primary rounded-l-none px-6">
                <Search className="h-5 w-5" />
              </button>
            </div>
            
            {/* Filter Section */}
            <div className="mt-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              
              <select
                value={selectedCuisine}
                onChange={handleCuisineChange}
                className="input w-40"
              >
                <option value="">All Cuisines</option>
                {uniqueCuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
              
              {/* New Diet Filter */}
              <select
                value={selectedDiet}
                onChange={handleDietChange}
                className="input w-40"
              >
                <option value="both">All Types</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>

              <button 
                type="button" 
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recipes Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p>Loading recipes...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">Found {filteredRecipes.length} recipes</p>
              </div>
              
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No recipes found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => {
                    // Parse JSON strings
                    const ingredients = JSON.parse(recipe.ingredients)
                    const mainIngredients = recipe.mainIngredients ? JSON.parse(recipe.mainIngredients) : []
                    return (
                      <div key={recipe.id} className="card">
                        <div className="h-48 rounded-md mb-4 overflow-hidden">
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
                                target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-12 w-12 text-gray-400"><path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1"/><path d="M19 15V6.5a1 1 0 0 0-7 0v11"/><path d="M2 14v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6"/><path d="M6 10V8a6 6 0 1 1 12 0v2"/></svg></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ChefHat className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 recipe-description">{recipe.description}</p>
                        
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
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {recipe.cookTime} min
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {recipe.servings} servings
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {recipe.cuisine}
                          </span>
                          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                            {recipe.difficulty}
                          </span>
                          {/* Add diet type indicator */}
                          {(() => {
                            try {
                              const tags = JSON.parse(recipe.tags);
                              const isVegetarian = tags.some((tag: string) => 
                                ['vegetarian', 'vegan', 'plant-based'].includes(tag.toLowerCase())
                              );
                              const isNonVegetarian = tags.some((tag: string) => 
                                ['beef', 'chicken', 'pork', 'fish', 'seafood', 'meat', 'lamb', 'turkey', 'duck', 'non-vegetarian'].includes(tag.toLowerCase())
                              );
                              
                              if (isVegetarian) {
                                return <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">Veg</span>;
                              } else if (isNonVegetarian) {
                                return <span className="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded">Non-Veg</span>;
                              }
                            } catch (e) {
                              // If parsing fails, don't show diet indicator
                            }
                            return null;
                          })()}
                        </div>
                        
                        <div className="mt-4">
                          <Link href={`/recipe/${recipe.id}`} className="btn-primary w-full text-center block">
                            View Recipe
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}