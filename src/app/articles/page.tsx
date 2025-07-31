import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import CategoryMenuArticle from "@/components/category-menu-article"
import { Eye, Heart, Calendar, Plus } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/authOptions"

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

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

async function getArticles(category?: string): Promise<ArticleItem[]> {
  try {
    const res = await fetch(`${backendUrl}/api/v1/article`, {
      cache: "no-store",
    })
    const data = await res.json()
    if (data.success) {
      let articleItems = data.data
      if (category) {
        articleItems = articleItems.filter((item: ArticleItem) => {
          if (!item.category) return false
          const categories = Array.isArray(item.category) ? item.category : [item.category]
          return categories.some((cat: string) => cat && cat.trim().toLowerCase() === category.toLowerCase())
        })
      }
      return articleItems
    }
  } catch (error) {
    console.error("Error fetching articles:", error)
  }
  return []
}

interface ArticlesPageProps {
  searchParams: { category?: string }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const currentCategory = searchParams.category
  const articleItems = await getArticles(currentCategory)
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen bg-[#1A2341] text-white px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header with Add Article Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">บทความ</h1>
          {session?.user?.role === "lawyer" && (
            <Link
              href="/articles/create"
              className="inline-flex items-center gap-2 bg-[#C9A55C] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#B8944A] transition-colors font-medium text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">สร้างบทความ</span>
              <span className="sm:hidden">สร้าง</span>
            </Link>
          )}
        </div>

        {/* Category Menu */}
        <Suspense fallback={<div className="h-12 sm:h-16 bg-gray-200 animate-pulse rounded-lg mb-4 sm:mb-6"></div>}>
          <CategoryMenuArticle currentCategory={currentCategory} />
        </Suspense>

        {/* Articles Grid */}
        {articleItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 text-base sm:text-lg">
              {currentCategory
                ? `No articles found in "${currentCategory}" category`
                : "No articles available at the moment"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {articleItems.map((item) => (
              <ArticleCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ArticleCard({ item }: { item: ArticleItem }) {
  return (
    <div className="bg-white text-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative h-40 sm:h-48">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {item.category && (
          <span className="absolute top-2 left-2 bg-gray-200 text-black px-2 py-1 rounded text-xs font-medium">
            {Array.isArray(item.category) ? item.category[0] : item.category}
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3">{item.summary}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("th-TH")}</time>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{item.like_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{item.view_count || 0}</span>
            </div>
          </div>
        </div>
        <Link
          href={`/articles/${item._id}`}
          className="inline-block w-full text-center bg-[#C9A55C] text-white py-2 px-4 rounded-lg hover:bg-[#C9A55C] transition-colors text-sm sm:text-base"
        >
          อ่านเพิ่มเติม
        </Link>
      </div>
    </div>
  )
}
