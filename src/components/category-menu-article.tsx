"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"

type Category = {
  _id: string
  name: string
  count: number
}

type ArticleItem = {
  _id: string
  title: string
  summary: string
  content: string
  image: string
  createdAt: string
  category?: string[]
  view_count?: number
  like_count?: number
}

interface CategoryMenuProps {
  currentCategory?: string
}

export default function CategoryMenuArticle({ currentCategory }: CategoryMenuProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchCategoriesFromArticles()
  }, [])

  const fetchCategoriesFromArticles = async () => {
    try {
      // Fetch all articles to extract categories
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/article`, {
        cache: "no-store",
      })
      const data = await res.json()
      if (data.success) {
        const articleItems = data.data
        const categoryMap = new Map<string, number>()

        // Extract and count categories from article items
        articleItems.forEach((item: ArticleItem) => {
          if (item.category) {
            const categories = Array.isArray(item.category) ? item.category : [item.category]
            categories.forEach((cat: string) => {
              if (cat && cat.trim()) {
                const categoryName = cat.trim()
                categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
              }
            })
          }
        })

        // Convert map to array of category objects
        const dynamicCategories: Category[] = Array.from(categoryMap.entries()).map(([name, count], index) => ({
          _id: `cat-${index}`,
          name,
          count,
        }))

        // Sort categories by count (descending) then by name
        dynamicCategories.sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count
          }
          return a.name.localeCompare(b.name)
        })

        setCategories(dynamicCategories)
      }
    } catch (error) {
      console.error("Error fetching categories from articles:", error)
      // Fallback to empty array if fetch fails
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryName === "all") {
      params.delete("category")
    } else {
      params.set("category", categoryName)
    }
    router.push(`/articles?${params.toString()}`)
    setIsOpen(false)
  }

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    router.push(`/articles?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 mb-6">
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
        <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white text-black border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Categories
          {currentCategory && (
            <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              {currentCategory}
            </span>
          )}
        </button>
      </div>

      {/* Category Menu */}
      <div className={`${isOpen ? "block" : "hidden"} md:block`}>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-white font-medium mr-2 hidden md:inline">Filter by:</span>

          {/* All Categories Button */}
          <button
            onClick={() => handleCategorySelect("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !currentCategory
                ? "bg-[#C9A55C] text-white hover:bg-[#C9A55C]"
                : "bg-white text-black border border-gray-300 hover:bg-gray-100"
            }`}
          >
            All Articles
          </button>

          {/* Category Buttons */}
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategorySelect(category.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentCategory === category.name
                  ? "bg-[#C9A55C] text-white hover:bg-[#C9A55C]"
                  : "bg-white text-black border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {category.name}
              <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                {category.count}
              </span>
            </button>
          ))}

          {/* Clear Filter Button */}
          {currentCategory && (
            <button
              onClick={clearCategory}
              className="px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
