'use client'

import Link from 'next/link'
import { Search, ChefHat, Clock, Users, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface Recipe {
  id: string
  title: string
  description: string
  cookTime: number
  servings: number
  imageUrl?: string
}

export default function HomePage() {
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([])
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const accessToken = Cookies.get('accessToken')
    if (!accessToken) {
      // Redirect to login page if not authenticated
      router.push('/login')
      return
    }
    
    fetchTrendingRecipes()
  }, [router])

  const fetchTrendingRecipes = async () => {
    try {
      const response = await fetch('/api/recipes?limit=3')
      const data = await response.json()
      setTrendingRecipes(data.recipes)
    } catch (error) {
      console.error('Error fetching trending recipes:', error)
      // Fallback to placeholder data
      setTrendingRecipes([
        {
          id: '1',
          title: 'Delicious Recipe 1',
          description: 'A brief description of this amazing recipe...',
          cookTime: 30,
          servings: 4
        },
        {
          id: '2',
          title: 'Delicious Recipe 2',
          description: 'A brief description of this amazing recipe...',
          cookTime: 30,
          servings: 4
        },
        {
          id: '3',
          title: 'Delicious Recipe 3',
          description: 'A brief description of this amazing recipe...',
          cookTime: 30,
          servings: 4
        }
      ])
    }
  }

  // If no access token, don't render the page content
  const accessToken = typeof window !== 'undefined' ? Cookies.get('accessToken') : null
  if (!accessToken) {
    return null // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">CooklyAI</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-orange-500 font-medium">Home</Link>
              <Link href="/search" className="text-gray-700 hover:text-orange-500">Recipes</Link>
              <Link href="/recommend" className="text-gray-700 hover:text-orange-500">Get Recommendations</Link>
            </nav>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  Cookies.remove('accessToken')
                  Cookies.remove('refreshToken')
                  Cookies.remove('user')
                  router.push('/login')
                }}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Recipe
            <span className="text-orange-500"> Recommendations</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover personalized recipes based on your ingredients, dietary preferences, and cooking time.
            Powered by advanced AI for the perfect meal every time.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex">
              <input
                type="text"
                placeholder="Enter ingredients you have..."
                className="input rounded-r-none"
              />
              <Link href="/recommend" className="btn-primary rounded-l-none px-6">
                <Search className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <Link href="/recommend" className="btn-primary text-lg px-8 py-3">
            Get Personalized Suggestions
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CooklyAI?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI understands your preferences and creates the perfect recipe recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-600">
                Find recipes by ingredients, cuisine, diet, or cook time with intelligent filtering.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
              <p className="text-gray-600">
                Get personalized recipe suggestions with explanations of why they're perfect for you.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Time-Saving</h3>
              <p className="text-gray-600">
                Quick recipes for busy days or elaborate meals for special occasions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Recipes */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Recipes</h2>
            <p className="text-gray-600">Popular recipes loved by our community</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingRecipes.map((recipe) => (
              <div key={recipe.id} className="card">
                <div className="h-48 rounded-md mb-4 overflow-hidden">
                  {recipe.imageUrl ? (
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gray background if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200"></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {recipe.cookTime} min
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {recipe.servings} servings
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/search" className="btn-primary">
              Browse All Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="h-6 w-6 text-orange-500" />
                <span className="text-xl font-bold">CooklyAI</span>
              </div>
              <p className="text-gray-400">
                AI-powered recipe recommendations for every taste and occasion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/recommend">AI Recommendations</Link></li>
                <li><Link href="/search">Recipe Search</Link></li>
                <li><Link href="/shopping-list">Shopping Lists</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/api">API Docs</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CooklyAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}