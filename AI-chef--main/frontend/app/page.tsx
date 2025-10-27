'use client'

import Link from 'next/link'
import { Search, ChefHat, Clock, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface Recipe {
  id: string
  title: string
  description: string
  cookTime: number
  servings: number
  imageUrl?: string
  mainIngredients?: string[]
}

// Carousel Component
const RecipeCarousel = ({ recipes }: { recipes: Recipe[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const [itemsToShow, setItemsToShow] = useState(3)

  // Update items to show based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          setItemsToShow(1.2) // Mobile: show 1.2 items to indicate scrollability
        } else if (window.innerWidth < 1024) {
          setItemsToShow(2) // Tablet: 2 items
        } else {
          setItemsToShow(3) // Desktop: 3 items
        }
      }
    }

    handleResize() // Set initial value
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (!isHovered && recipes.length > 0) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % recipes.length)
      }, 4500)
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [isHovered, recipes.length])

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + recipes.length) % recipes.length)
  }

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % recipes.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const swipeThreshold = 50 // Minimum swipe distance in pixels
    
    if (touchStartX.current - touchEndX.current > swipeThreshold) {
      // Swipe left - go to next slide
      goToNext()
    } else if (touchEndX.current - touchStartX.current > swipeThreshold) {
      // Swipe right - go to previous slide
      goToPrevious()
    }
  }

  return (
    <div 
      className="relative group carousel-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div 
          ref={carouselRef}
          className="carousel-track"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {recipes.map((recipe, index) => (
            <div 
              key={recipe.id} 
              className="carousel-slide"
              style={{ width: `${100 / itemsToShow}%` }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <RecipeCard 
                recipe={recipe} 
                isHovered={hoveredCard === index} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        className={`carousel-nav-btn prev ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        onClick={goToPrevious}
        aria-label="Previous recipe"
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>
      <button 
        className={`carousel-nav-btn next ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        onClick={goToNext}
        aria-label="Next recipe"
      >
        <ChevronRight className="h-6 w-6 text-gray-800" />
      </button>

      {/* Pagination Dots */}
      <div className="carousel-dots">
        {recipes.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-dot ${index === currentIndex ? 'active' : 'inactive'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Recipe Card Component
const RecipeCard = ({ recipe, isHovered }: { recipe: Recipe; isHovered: boolean }) => {
  return (
    <Link href={`/recipe/${recipe.id}`} className="block h-full">
      <div className={`card ${isHovered ? 'transform scale-105 shadow-lg' : 'shadow-md'}`}>
        <div className="recipe-card-image-container">
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="recipe-card-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200"></div>';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}
          
          {/* Hover Overlay */}
          {isHovered && (
            <div className="recipe-card-overlay">
              <h4 className="text-white font-semibold mb-2">Main Ingredients</h4>
              <div className="text-white text-sm mb-3">
                {recipe.mainIngredients && recipe.mainIngredients.length > 0 ? (
                  <ul className="recipe-card-ingredient-list">
                    {recipe.mainIngredients.slice(0, 3).map((ingredient, idx) => (
                      <li key={idx}>{ingredient}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No ingredients listed</p>
                )}
              </div>
              <div className="recipe-card-time">
                <Clock className="h-4 w-4 mr-1" />
                {recipe.cookTime} min
              </div>
            </div>
          )}
        </div>
        
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <p className="recipe-card-description">{recipe.description}</p>
        
        {/* Info Bar - Always visible */}
        <div className="recipe-card-info">
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
    </Link>
  )
}

// New Refined Hero Recipe Slider Component
const RefinedHeroRecipeSlider = ({ recipes }: { recipes: Recipe[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [progress, setProgress] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next')
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll functionality - every 3 seconds as requested
  useEffect(() => {
    if (!isHovered && (recipes.length + 1) > 0) { // +1 for the CTA slide
      // Reset and start progress bar animation
      setProgress(0)
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressRef.current as NodeJS.Timeout)
            return 100
          }
          return prev + (100 / 30) // 30 steps for 3 seconds
        })
      }, 100)

      // Auto-scroll to next slide after 3 seconds
      autoScrollRef.current = setTimeout(() => {
        setSlideDirection('next')
        setCurrentIndex(prevIndex => (prevIndex + 1) % (recipes.length + 1)) // +1 for the CTA slide
      }, 3000)
    }

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current)
      }
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current)
      }
    }
  }, [isHovered, recipes.length, currentIndex])

  const goToPrevious = () => {
    setSlideDirection('prev')
    setCurrentIndex(prevIndex => (prevIndex - 1 + (recipes.length + 1)) % (recipes.length + 1))
    setProgress(0) // Reset progress bar
  }

  const goToNext = () => {
    setSlideDirection('next')
    setCurrentIndex(prevIndex => (prevIndex + 1) % (recipes.length + 1))
    setProgress(0) // Reset progress bar
  }

  const goToSlide = (index: number) => {
    setSlideDirection(index > currentIndex ? 'next' : 'prev')
    setCurrentIndex(index)
    setProgress(0) // Reset progress bar
  }

  // Gradient style - reversed as requested (darkest on left)
  const gradientStyle = isMobile
    ? 'linear-gradient(to top, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.1) 100%)'
    : 'linear-gradient(to left, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.8) 80%)'

  // Check if we're on the CTA slide
  const isCtaSlide = currentIndex === recipes.length

  return (
    <div className="relative group">
      {/* Navigation Arrows - Positioned completely outside the main container */}
      <button 
        className={`absolute top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 ${
          isMobile ? 'hidden' : 'left-0 -translate-x-full'
        }`}
        onClick={goToPrevious}
        aria-label="Previous recipe"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ChevronLeft className="h-8 w-8 text-white" />
      </button>
      <button 
        className={`absolute top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 ${
          isMobile ? 'hidden' : 'right-0 translate-x-full'
        }`}
        onClick={goToNext}
        aria-label="Next recipe"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ChevronRight className="h-8 w-8 text-white" />
      </button>

      {/* Slider Container - Full width hero style */}
      <div 
        className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isCtaSlide ? (
          // CTA Slide
          <div className="h-full w-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <h3 className="text-4xl md:text-5xl font-bold mb-6">Discover More Amazing Recipes</h3>
              <p className="text-xl mb-8 max-w-2xl mx-auto">Explore our full collection of delicious recipes tailored to your taste</p>
              <button 
                onClick={() => router.push('/search')}
                className="btn-primary text-lg px-8 py-4 rounded-full"
              >
                Browse All Recipes
              </button>
            </div>
          </div>
        ) : (
          // Recipe Slide
          <Link href={`/recipe/${recipes[currentIndex].id}`} className="block h-full">
            <div 
              className="h-full w-full bg-cover bg-center relative"
              style={{ 
                backgroundImage: recipes[currentIndex].imageUrl 
                  ? `${gradientStyle}, url(${recipes[currentIndex].imageUrl})`
                  : `${gradientStyle}, url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJoLTggdy04IHRleHQtZ3JheS00MDAiPjxwYXRoIGQ9Ik0xNyAyMXYtMmExIDEgMCAwIDEtMS0xdi0xYTItMiAwIDAgMSAyLTJoMmEyIDIgMCAwIDEgMiAydjFhMSAxIDAgMCAxLTEgMXoiLz48cGF0aCBkPSJNMTkgMTVWNi41YTEgMSAwIDAgMC03IDBWNi41YTEgMSAwIDAgMC03IDBWNTEiLz48cGF0aCBkPSJNMiAxNHY2YTEgMSAwIDAgMCAxIDFoMmExIDEgMCAwIDAgMS0xdi02Ii8+PHBhdGggZD0iTTYgMTBWOGE2IDYgMCAxIDEgMTIgMHYyIi8+PC9zdmc+')`
              }}
            >
              {/* Text content positioned on the left side */}
              <div className="absolute inset-0 flex items-center justify-start p-8 md:p-12">
                <div className="w-full md:w-1/2 lg:w-2/5 text-white">
                  <h3 className="text-4xl md:text-5xl font-bold mb-4">{recipes[currentIndex].title}</h3>
                  <p className="text-xl md:text-2xl mb-6 opacity-90">{recipes[currentIndex].description}</p>
                  
                  {/* Details - Only visible on hover */}
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="pt-4 border-t border-white border-opacity-30">
                      <div className="mb-3">
                        <h4 className="font-semibold text-lg mb-2">Key Ingredients:</h4>
                        <div className="flex flex-wrap gap-2">
                          {recipes[currentIndex].mainIngredients && recipes[currentIndex].mainIngredients.length > 0 ? (
                            recipes[currentIndex].mainIngredients.slice(0, 5).map((ingredient, idx) => (
                              <span key={idx} className="bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                                {ingredient}
                              </span>
                            ))
                          ) : (
                            <span className="text-white text-opacity-70">No ingredients listed</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          <span>{recipes[currentIndex].cookTime} min</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          <span>{recipes[currentIndex].servings} servings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Timeline Progress Bar - visually joined to the slider */}
      <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden -mt-0.5">
        <div 
          className="h-full bg-orange-500 rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Recipe Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {[...Array(recipes.length + 1)].map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-orange-500 w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      const response = await fetch('/api/recipes?limit=10')
      const data = await response.json()
      setTrendingRecipes(data.recipes.map((recipe: any) => {
        // Parse mainIngredients if it's a JSON string
        let mainIngredients = [];
        if (recipe.mainIngredients) {
          try {
            mainIngredients = typeof recipe.mainIngredients === 'string' 
              ? JSON.parse(recipe.mainIngredients) 
              : recipe.mainIngredients;
          } catch (e) {
            mainIngredients = ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'];
          }
        } else {
          mainIngredients = ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'];
        }
        
        return {
          ...recipe,
          mainIngredients
        };
      }));
    } catch (error) {
      console.error('Error fetching trending recipes:', error)
      // Fallback to placeholder data
      setTrendingRecipes([
        {
          id: '1',
          title: 'Prawn Curry',
          description: 'Spicy and tangy curry with fresh prawns in a coconut milk base.',
          cookTime: 25,
          servings: 4,
          mainIngredients: ['Prawns', 'Coconut Milk', 'Onion', 'Tomato', 'Spices']
        },
        {
          id: '2',
          title: 'Gulab Jamun',
          description: 'Soft and spongy milk solids fried and soaked in sugar syrup.',
          cookTime: 40,
          servings: 6,
          mainIngredients: ['Milk Powder', 'Flour', 'Ghee', 'Sugar', 'Cardamom']
        },
        {
          id: '3',
          title: 'Vegetable Korma',
          description: 'Creamy and aromatic curry with mixed vegetables in a rich sauce.',
          cookTime: 35,
          servings: 4,
          mainIngredients: ['Mixed Vegetables', 'Coconut Cream', 'Onion', 'Cashews', 'Spices']
        },
        {
          id: '4',
          title: 'Butter Chicken',
          description: 'Creamy tomato-based curry with tender chicken pieces.',
          cookTime: 45,
          servings: 4,
          mainIngredients: ['Chicken', 'Tomato', 'Cream', 'Butter', 'Spices']
        },
        {
          id: '5',
          title: 'Dosa',
          description: 'Crispy South Indian crepe made from fermented rice and lentil batter.',
          cookTime: 30,
          servings: 2,
          mainIngredients: ['Rice', 'Urad Dal', 'Fenugreek', 'Salt', 'Oil']
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Client-side only check for accessToken to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  const accessToken = Cookies.get('accessToken')
  if (!accessToken) {
    return null
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

      {/* Trending Recipes Slider - Moved to new position */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Recipes</h2>
            <p className="text-gray-600">Popular recipes loved by our community</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <RefinedHeroRecipeSlider recipes={trendingRecipes} />
          )}
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
                Get personalized recipe suggestions with explanations of why they&#39;re perfect for you.
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

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Tell Us What You Have</h3>
                <p className="text-gray-600">List the ingredients in your kitchen and we&#39;ll find recipes you can make right now.</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Smart Recommendations</h3>
                <p className="text-gray-600">Our AI matches your ingredients with recipes and customizes instructions for what you have.</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Cook with Confidence</h3>
                <p className="text-gray-600">Follow step-by-step instructions that skip ingredients you don&#39;t have and suggest substitutions.</p>
              </div>
            </div>
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