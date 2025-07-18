import { notFound } from "next/navigation"
import Image from "next/image"
import ShareButton from "@/components/ShareButton"
import ArticleLikeButton from "@/components/article-like-button"
import { Eye, Heart, ArrowLeft } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import Link from "next/link"
// Removed: import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    photo?: string // optional if you plan to use a photo later
  }
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

async function getArticleById(id: string): Promise<ArticleItem | null> {
  try {
    const res = await fetch(`${backendUrl}/api/v1/article/${id}`, {
      cache: "no-store",
    })
    const data = await res.json()
    console.log("Article Data : ", data)
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
  console.log("check session", session?.accessToken)

  if (!articleItem) return notFound() // [^1]

  // Check if user has liked this article item
  let initiallyLiked = false
  if (session?.accessToken) {
    initiallyLiked = await checkIfArticleLiked(params.id, session.accessToken)
  }

  return (
    <main className="min-h-screen bg-[#1A2341] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* ปุ่มย้อนกลับและเมนูหมวดหมู่ */}
        <div className="mb-6">
          <Link href="/articles">
            <button className="mb-4 bg-white text-black border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {"ย้อนกลับไปที่บทความทั้งหมด"}
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* บทความหลัก */}
          <section className="md:col-span-2 bg-white text-black rounded-xl p-6 shadow-lg">
            {/* Article Title moved here */}
            <h1 className="text-2xl md:text-3xl font-semibold mb-4">{articleItem.title}</h1>
            {/* Combined Poster Info and Post Date */}
            <div className="flex justify-between items-center text-xs text-gray-500 my-5 px-16">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-200">
                  <Image
                    src={articleItem.poster_id?.photo || "/img/default-avatar.jpg?height=48&width=48"}
                    alt={articleItem.poster_id?.name || "Poster"}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                  {!articleItem.poster_id?.photo && (
                    <span className="text-gray-600 text-lg font-semibold">
                      {articleItem.poster_id?.name ? articleItem.poster_id.name.charAt(0).toUpperCase() : "UN"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  {articleItem.poster_id?.name && (
                    <p className="text-sm text-gray-600 font-medium">
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
              <div className="flex items-center gap-4">
                {/* ปุ่มถูกใจ */}
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
                {/* ปุ่มแชร์ */}
                <ShareButton />
                {/* จำนวนการเข้าชม */}
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">{articleItem.view_count || 0}</span>
                </div>
              </div>
            </div>
            <div
              className="relative w-full max-w-2xl h-80 mx-auto rounded-2xl overflow-hidden mb-12"
              style={{ paddingTop: "56.25%" }}
            >
              <Image
                src={articleItem.image || "/placeholder.svg"}
                alt={articleItem.title}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
              />
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line px-16">{articleItem.content}</p>
            {/* แสดงหมวดหมู่ */}
            {articleItem.category && (
              <div className="mt-14 px-16">
                <span className="bg-gray-200 text-black px-3 py-1 rounded-3xl text-sm font-medium">
                  {Array.isArray(articleItem.category) ? articleItem.category.join(", ") : articleItem.category}
                </span>
              </div>
            )}
          </section>
          {/* แถบด้านข้าง */}
          <OtherArticles currentId={articleItem._id} />
        </div>
      </div>
    </main>
  )
}

// Sidebar component with images
async function OtherArticles({ currentId }: { currentId: string }) {
  const res = await fetch(`${backendUrl}/api/v1/article`, {
    cache: "no-store",
  })
  const data = await res.json()
  if (!data.success) return null
  const otherArticles: ArticleItem[] = data.data.filter((item: ArticleItem) => item._id !== currentId).slice(0, 5)

  return (
    <aside className="space-y-4">
      <h3 className="text-white font-semibold text-lg mb-4">{"บทความที่เกี่ยวข้อง"}</h3>
      {otherArticles.length === 0 ? (
        <div className="text-gray-300 italic">{"ไม่พบบทความที่เกี่ยวข้อง"}</div>
      ) : (
        otherArticles.map((item: ArticleItem) => (
          <Link
            key={item._id}
            href={`/articles/${item._id}`}
            className="flex flex-col bg-white/80 text-black rounded-lg shadow-md hover:bg-gray-100 transition min-h-[100px]"
          >
            <div className="flex items-center">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                width={120}
                height={90}
                unoptimized
                className="object-cover rounded-l-lg w-[180px] h-[120px]"
              />
              <div className="flex flex-col flex-grow px-4">
                <span className="text-base font-medium">{item.title}</span>
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
