"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"

type ArticleItem = {
  _id: string
  title: string
  summary?: string
  content: string
  image: string
  createdAt: string
  view_count: number
}

export default function Article() {
  const [articleItems, setArticleItems] = useState<ArticleItem[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/article`)
        const data = await res.json()
        if (data.success) {
          console.log(data.data);
          setArticleItems(data.data)
        } else {
          console.error("Failed to fetch articles:", data.message)
        }
      } catch (err) {
        console.error("Error fetching articles:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [backendUrl])

  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1)
  }

  const handleNext = () => {
    if (startIndex + 4 < articleItems.length) setStartIndex(startIndex + 1)
  }

  const visibleItems = articleItems.slice(startIndex, startIndex + 4)

  if (loading) {
    return <p className="text-center py-10">Loading articles...</p>
  }

  return (
    <section className="relative px-28 py-10 text-white">
      {/* Left Button */}
      <button
        onClick={handlePrev}
        disabled={startIndex === 0}
        className="absolute left-10 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700 disabled:opacity-40"
      >
        <HiChevronLeft className="w-5 h-5 text-white" />
      </button>

      {/* Right Button */}
      <button
        onClick={handleNext}
        disabled={startIndex + 4 >= articleItems.length}
        className="absolute right-10 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700 disabled:opacity-40"
      >
        <HiChevronRight className="w-5 h-5 text-white" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center">
        {visibleItems.map((item) => (
          <Link key={item._id} href={`/articles/${item._id}`}>
            <div>
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                width={500}
                height={300}
                unoptimized
                className="object-cover w-full h-48"
              />
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-[700] text-white mb-3">{item.title}</h2>
                <p className="text-white font-[100] line-clamp-3 flex-grow">
                  {item.summary || item.content.slice(0, 100) + "..."}
                </p>
                <div className="w-2/8 border-t border-white mt-4"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{item.view_count} views</span>
                  <span className="text-sm text-gray-300">
                    {new Date(item.createdAt).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
