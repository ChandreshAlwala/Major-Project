'use client'

import { useState, useEffect } from 'react'

interface Recipe {
  id: string
  title: string
  description: string
  imageUrl?: string
}

export default function TestImagesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      console.log('Fetching recipes from API...')
      const response = await fetch('/api/recipes?limit=5')
      console.log('API response status:', response.status)
      const data = await response.json()
      console.log('API response data:', data)
      
      // Log the first recipe to see its structure
      if (data.recipes && data.recipes.length > 0) {
        console.log('First recipe:', data.recipes[0])
        console.log('First recipe imageUrl:', data.recipes[0].imageUrl)
      }
      
      setRecipes(data.recipes || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching recipes:', err)
      setError('Failed to load recipes')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading recipes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Images Page</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="card">
              <div className="h-48 rounded-md mb-4 overflow-hidden">
                {recipe.imageUrl ? (
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', recipe.imageUrl)
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><p class="text-gray-500">Image failed to load</p></div>'
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image URL</p>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
              <p className="text-xs text-gray-500">Image URL: {recipe.imageUrl || 'None'}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <button 
            onClick={fetchRecipes}
            className="btn-primary"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}