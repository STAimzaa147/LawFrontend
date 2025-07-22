"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"

function useResponsiveCards() {
  const [cardsToShow, setCardsToShow] = useState(1)

  useEffect(() => {
    const updateCardsToShow = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setCardsToShow(4) // lg+
      } else if (width >= 768) {
        setCardsToShow(2) // md
      } else {
        setCardsToShow(1) // sm and below
      }
    }

    updateCardsToShow()
    window.addEventListener("resize", updateCardsToShow)
    return () => window.removeEventListener("resize", updateCardsToShow)
  }, [])

  return cardsToShow
}

type NewsItem = {
  _id: string
  title: string
  summary?: string
  content: string
  image: string
  createdAt: string
  view_count: number
}

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const cardsToShow = useResponsiveCards()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/news`)
        const data = await res.json()
        if (data.success) {
          setNewsItems(data.data)
        } else {
          console.error("Failed to fetch news:", data.message)
        }
      } catch (err) {
        console.error("Error fetching news:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [backendUrl])

  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1)
  }

  const handleNext = () => {
  if (startIndex + cardsToShow < newsItems.length) setStartIndex(startIndex + 1)
}

  const visible = newsItems.slice(startIndex, startIndex + cardsToShow)

  if (loading) {
    return <p className="text-center py-10">Loading news...</p>
  }

  return (
    <section className="relative px-4 py-10 text-white overflow-hidden">
      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        disabled={startIndex === 0}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700 disabled:opacity-40"
      >
        <HiChevronLeft className="w-5 h-5 text-white" />
      </button>

      <button
        onClick={handleNext}
        disabled={startIndex + cardsToShow >= newsItems.length}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700 disabled:opacity-40"
      >
        <HiChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visible.map((item) => (
          <Link key={item._id} href={`/news/${item._id}`} className="bg-white/5 rounded-lg overflow-hidden shadow-md h-full flex flex-col">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              width={500}
              height={300}
              unoptimized
              className="object-cover w-full h-48"
            />
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold text-white mb-2">{item.title}</h2>
              <p className="text-sm text-white font-light line-clamp-3 flex-grow">
                {item.summary || item.content.slice(0, 100) + "..."}
              </p>
              <div className="border-t border-white/20 mt-4 pt-2 text-sm text-gray-300 flex justify-between items-center">
                <span>{item.view_count} views</span>
                <span>
                  {new Date(item.createdAt).toLocaleString("th-TH", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
