import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import CategoryMenu from "@/components/category-menu"
import { Eye, Heart, Calendar } from "lucide-react"

type NewsItem = {
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

async function getNews(category?: string): Promise<NewsItem[]> {
  try {
    // Always fetch all news first
    const res = await fetch(`${backendUrl}/api/v1/news`, {
      cache: "no-store",
    })
    const data = await res.json()

    if (data.success) {
      let newsItems = data.data

      // Filter by category on the client side if category is specified
      if (category) {
        newsItems = newsItems.filter((item: NewsItem) => {
          if (!item.category) return false

          const categories = Array.isArray(item.category) ? item.category : [item.category]
          return categories.some((cat: string) => cat && cat.trim().toLowerCase() === category.toLowerCase())
        })
      }

      return newsItems
    }
  } catch (error) {
    console.error("Error fetching news:", error)
  }
  return []
}

interface NewsPageProps {
  searchParams: { category?: string }
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const currentCategory = searchParams.category
  const newsItems = await getNews(currentCategory)

  return (
    <main className="min-h-screen bg-[#1A2341] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Category Menu */}
        <Suspense fallback={<div className="h-16 bg-gray-200 animate-pulse rounded-lg mb-6"></div>}>
          <CategoryMenu currentCategory={currentCategory} />
        </Suspense>

        {/* News Grid */}
        {newsItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {currentCategory ? `No news found in "${currentCategory}" category` : "No news available at the moment"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((item) => (
              <NewsCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  console.log("news : ",item);
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
              <span>{item.like_count }</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{item.view_count || 0}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/news/${item._id}`}
          className="inline-block w-full text-center bg-[#C9A55C] text-white py-2 px-4 rounded-lg hover:bg-[#C9A55C] transition-colors"
        >
          Read More
        </Link>
      </div>
    </div>
  )
}
