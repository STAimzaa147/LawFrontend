import { notFound } from "next/navigation"
import Image from "next/image"
import ShareButton from "@/components/ShareButton"
import ArticleLikeButton from "@/components/article-like-button"
import ArticleMenu from "@/components/article-menu"
import { Eye, Heart, ArrowLeft } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import Link from "next/link"

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
  poster_id?: {
    _id: string
    name: string
    photo?: string
  }
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

async function getArticleById(id: string): Promise<ArticleItem | null> {
  try {
    const res = await fetch(`${backendUrl}/api/v1/article/${id}`, {
      cache: "no-store",
    })
    const data = await res.json()
    if (data.success) {
      return data.data
    }
  } catch (err) {
    console.error("Error fetching article detail:", err)
  }
  return null
}

async function checkIfArticleLiked(articleId: string, accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${backendUrl}/api/v1/article/${articleId}/like`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (res.ok) {
      const data = await res.json()
      return data.liked || false
    }
  } catch (error) {
    console.error("Failed to check like status:", error)
  }
  return false
}

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const articleItem = await getArticleById(params.id)
  const session = await getServerSession(authOptions)

  if (!articleItem) return notFound()

  let initiallyLiked = false
  if (session?.accessToken) {
    initiallyLiked = await checkIfArticleLiked(params.id, session.accessToken)
  }

  return (
    <main className="min-h-screen bg-[#1A2341] text-white px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link href="/articles">
            <button className="mb-4 bg-white text-black border border-gray-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">ย้อนกลับไปที่บทความทั้งหมด</span>
              <span className="sm:hidden">ย้อนกลับ</span>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Article */}
          <section className="lg:col-span-2 bg-white text-black rounded-xl p-4 sm:p-6 shadow-lg">
            {/* Article Header with Title and Menu */}
            <div className="flex justify-between items-start mb-4 gap-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold flex-1">{articleItem.title}</h1>
              <div className="flex-shrink-0">
                <ArticleMenu articleId={articleItem._id} authorId={articleItem.poster_id?._id || ""} />
              </div>
            </div>

            {/* Poster Info and Post Date */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500 my-4 sm:my-5 gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-200">
                  <Image
                    src={articleItem.poster_id?.photo || "/img/default-avatar.jpg?height=48&width=48"}
                    alt={articleItem.poster_id?.name || "Poster"}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                  {!articleItem.poster_id?.photo && (
                    <span className="text-gray-600 text-base sm:text-lg font-semibold">
                      {articleItem.poster_id?.name ? articleItem.poster_id.name.charAt(0).toUpperCase() : "UN"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  {articleItem.poster_id?.name && (
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      {"โดย "}
                      {articleItem.poster_id.name}
                    </p>
                  )}
                  <div className="text-xs text-gray-500">
                    {"เผยแพร่เมื่อ "}{" "}
                    <time dateTime={articleItem.createdAt}>
                      {new Date(articleItem.createdAt).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Like Button */}
                {session ? (
                  <ArticleLikeButton
                    articleId={articleItem._id}
                    initialCount={articleItem.like_count || 0}
                    initiallyLiked={initiallyLiked}
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600">{articleItem.like_count || 0}</span>
                  </div>
                )}
                {/* Share Button */}
                <ShareButton />
                {/* View Count */}
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">{articleItem.view_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Article Image */}
            <div className="relative w-full h-48 sm:h-64 md:h-80 mx-auto rounded-2xl overflow-hidden mb-6 sm:mb-8 md:mb-12">
              <Image
                src={articleItem.image || "/placeholder.svg"}
                alt={articleItem.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
              />
            </div>

            {/* Article Content */}
            <div className="prose max-w-none px-2 sm:px-4 md:px-8 lg:px-16">
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                {articleItem.content}
              </p>
            </div>

            {/* Category Tags */}
            {articleItem.category && (
              <div className="mt-8 sm:mt-10 md:mt-14 px-2 sm:px-4 md:px-8 lg:px-16">
                <span className="bg-gray-200 text-black px-3 py-1 rounded-3xl text-xs sm:text-sm font-medium">
                  {Array.isArray(articleItem.category) ? articleItem.category.join(", ") : articleItem.category}
                </span>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <OtherArticles currentId={articleItem._id} />
        </div>
      </div>
    </main>
  )
}

// Sidebar component
async function OtherArticles({ currentId }: { currentId: string }) {
  const res = await fetch(`${backendUrl}/api/v1/article`, {
    cache: "no-store",
  })
  const data = await res.json()

  if (!data.success) return null

  const otherArticles: ArticleItem[] = data.data.filter((item: ArticleItem) => item._id !== currentId).slice(0, 5)

  return (
    <aside className="space-y-4">
      <h3 className="text-white font-semibold text-base sm:text-lg mb-4">{"บทความที่เกี่ยวข้อง"}</h3>
      {otherArticles.length === 0 ? (
        <div className="text-gray-300 italic text-sm">{"ไม่พบบทความที่เกี่ยวข้อง"}</div>
      ) : (
        otherArticles.map((item: ArticleItem) => (
          <Link
            key={item._id}
            href={`/articles/${item._id}`}
            className="flex flex-col bg-white/80 text-black rounded-lg shadow-md hover:bg-gray-100 transition min-h-[80px] sm:min-h-[100px]"
          >
            <div className="flex items-center">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                width={120}
                height={90}
                unoptimized
                className="object-cover rounded-l-lg w-[120px] sm:w-[180px] h-[80px] sm:h-[120px]"
              />
              <div className="flex flex-col flex-grow px-3 sm:px-4">
                <span className="text-sm sm:text-base font-medium line-clamp-2">{item.title}</span>
                <div className="border-t border-black mt-1" />
                <time dateTime={item.createdAt} className="text-right text-xs text-gray-600 mt-2">
                  {new Date(item.createdAt).toLocaleString("th-TH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>
            </div>
          </Link>
        ))
      )}
    </aside>
  )
}
