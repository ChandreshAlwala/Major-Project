'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHat, Upload, Search } from 'lucide-react'

interface Recipe {
  id: string
  title: string
  imageUrl?: string
}

export default function AdminImageManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredRecipes(
        recipes.filter(recipe => 
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredRecipes(recipes)
    }
  }, [searchTerm, recipes])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes?limit=100')
      const data = await response.json()
      setRecipes(data.recipes)
      setFilteredRecipes(data.recipes)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching recipes:', error)
      setLoading(false)
    }
  }

  const updateRecipeImage = async (recipeId: string, imageUrl: string) => {
    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}/image`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        // Update local state
        setRecipes(recipes.map(recipe => 
          recipe.id === recipeId ? { ...recipe, imageUrl } : recipe
        ))
        setFilteredRecipes(filteredRecipes.map(recipe => 
          recipe.id === recipeId ? { ...recipe, imageUrl } : recipe
        ))
        alert('Recipe image updated successfully!')
        setSelectedRecipe(null)
        setNewImageUrl('')
      } else {
        alert('Failed to update recipe image')
      }
    } catch (error) {
      console.error('Error updating recipe image:', error)
      alert('Error updating recipe image')
    }
  }

  const handleImageUpdate = () => {
    if (selectedRecipe && newImageUrl) {
      updateRecipeImage(selectedRecipe.id, newImageUrl)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading recipes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">CooklyAI Admin</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/admin" className="text-gray-700 hover:text-orange-500">Dashboard</Link>
              <Link href="/admin/images" className="text-orange-500 font-medium">Image Manager</Link>
            </nav>
            <div>
              <Link href="/" className="btn-secondary">Back to Site</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipe Image Manager</h1>
            <p className="text-gray-600">Upload and manage images for your recipes</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recipes..."
                className="input rounded-r-none w-full"
              />
              <button className="btn-primary rounded-l-none px-6">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Image Update Panel */}
          {selectedRecipe && (
            <div className="card mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Update Image for: {selectedRecipe.title}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Image
                  </label>
                  <div className="h-48 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {selectedRecipe.imageUrl ? (
                      <img 
                        src={selectedRecipe.imageUrl} 
                        alt={selectedRecipe.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><p class="text-gray-500">Image not found</p></div>'
                        }}
                      />
                    ) : (
                      <div className="text-gray-500">No image</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Image URL
                  </label>
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="input w-full mb-4"
                  />
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleImageUpdate}
                      className="btn-primary flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Update Image
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRecipe(null)
                        setNewImageUrl('')
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recipe Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="card">
                <div className="h-48 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {recipe.imageUrl ? (
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><p class="text-gray-500">Image not found</p></div>'
                      }}
                    />
                  ) : (
                    <div className="text-gray-500">No image</div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-2 mt-4">{recipe.title}</h3>
                
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedRecipe(recipe)
                      setNewImageUrl(recipe.imageUrl || '')
                    }}
                    className="btn-primary w-full"
                  >
                    Update Image
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}