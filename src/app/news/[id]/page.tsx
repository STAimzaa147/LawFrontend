import { notFound } from "next/navigation"
import Image from "next/image"
import ShareButton from "@/components/ShareButton"
import { Eye, Heart } from "lucide-react"

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

async function getNewsById(id: string): Promise<NewsItem | null> {
  try {
    const res = await fetch(`${backendUrl}/api/v1/news/${id}`, {
      cache: "no-store",
    })
    const data = await res.json()
    console.log("Get big news", data)
    if (data.success) {
      return data.data
    }
  } catch (err) {
    console.error("Error fetching news detail:", err)
  }
  return null
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const newsItem = await getNewsById(params.id)

  if (!newsItem) return notFound()

  return (
    <main className="min-h-screen bg-[#1A2341] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Article */}
        <section className="md:col-span-2 bg-white text-black rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 ml-14">{newsItem.title}</h1>
          <div className="flex justify-between items-center text-xs text-gray-500 my-5 px-16">
            <div>
              Posted on{" "}
              <time dateTime={newsItem.createdAt}>
                {new Date(newsItem.createdAt).toLocaleString("th-TH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </div>

            <div className="flex items-center gap-4">
              
              {/* Like Count */}
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">{newsItem.like_count || 0}</span>
              </div>

              {/* Share Button */}
              <ShareButton />

              {/* View Count */}
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">{newsItem.view_count || 0}</span>
              </div>
              
            </div>
          </div>
          <div
            className="relative w-full max-w-2xl h-80 mx-auto rounded-2xl overflow-hidden mb-12"
            style={{ paddingTop: "56.25%" /* 9/16 ratio */ }}
          >
            <Image
              src={newsItem.image || "/placeholder.svg"}
              alt={newsItem.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1024px"
            />
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-line px-16">{newsItem.content}</p>

          {/* Tags section */}
          {newsItem.category && (
            <div className="mt-14 px-16">
              <span className="bg-gray-200 text-black px-3 py-1 rounded-3xl text-sm font-medium">
                {newsItem.category}
              </span>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <OtherNews currentId={newsItem._id} />
      </div>
    </main>
  )
}

// Sidebar component with images
async function OtherNews({ currentId }: { currentId: string }) {
  const res = await fetch(`${backendUrl}/api/v1/news`, {
    cache: "no-store",
  })
  const data = await res.json()

  if (!data.success) return null
  console.log("Get small news", data)
  const otherNews: NewsItem[] = data.data.filter((item: NewsItem) => item._id !== currentId).slice(0, 5)

  return (
    <aside className="space-y-4">
      {otherNews.map((item: NewsItem) => (
        <a
          key={item._id}
          href={`/news/${item._id}`}
          className="flex flex-col bg-white/80 text-black rounded-lg shadow-md hover:bg-gray-100 transition min-h-[100px]"
        >
          <div className="flex items-center ">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              width={120}
              height={90}
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
        </a>
      ))}
    </aside>
  )
}
