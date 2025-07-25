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
    // Always fetch all articles first
    const res = await fetch(`${backendUrl}/api/v1/article`, {
      cache: "no-store",
    })
    const data = await res.json()
    if (data.success) {
      let articleItems = data.data
      // Filter by category on the client side if category is specified
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
  const session = await getServerSession(authOptions); // ✅ SERVER-SIDE session

  return (
    <main className="min-h-screen bg-[#1A2341] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header with Add Article Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">บทความ</h1>
          {session?.user?.role === "lawyer" && (
            <Link
              href="/articles/create"
              className="inline-flex items-center gap-2 bg-[#C9A55C] text-white px-4 py-2 rounded-lg hover:bg-[#B8944A] transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              สร้างบทความ
            </Link>
            )}
        </div>

        {/* Category Menu */}
        <Suspense fallback={<div className="h-16 bg-gray-200 animate-pulse rounded-lg mb-6"></div>}>
          <CategoryMenuArticle currentCategory={currentCategory} />
        </Suspense>

        {/* Articles Grid */}
        {articleItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {currentCategory
                ? `No articles found in "${currentCategory}" category`
                : "No articles available at the moment"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  console.log("article : ", item)
  return (
    <div className="bg-white text-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative h-48">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {item.category && (
          <span className="absolute top-2 left-2 bg-gray-200 text-black px-2 py-1 rounded text-xs font-medium">
            {Array.isArray(item.category) ? item.category[0] : item.category}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.summary}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("th-TH")}</time>
          </div>
          <div className="flex items-center gap-3">
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
          className="inline-block w-full text-center bg-[#C9A55C] text-white py-2 px-4 rounded-lg hover:bg-[#C9A55C] transition-colors"
        >
          อ่านเพิ่มเติม
        </Link>
      </div>
    </div>
  )
}
