"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Eye, Calendar } from "lucide-react"

function useResponsiveCards() {
  const [cardsToShow, setCardsToShow] = useState(1)

  useEffect(() => {
    const updateCardsToShow = () => {
      const width = window.innerWidth
      if (width >= 1280) {
        setCardsToShow(4) // xl
      } else if (width >= 1024) {
        setCardsToShow(3) // lg
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
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-3 text-white">กำลังโหลดข่าว...</span>
      </div>
    )
  }

  if (newsItems.length === 0) {
    return (
      <div className="text-center py-16 text-white">
        <p className="text-lg">ไม่มีข่าวในขณะนี้</p>
      </div>
    )
  }

  return (
    <section className="relative px-4 sm:px-8 lg:px-16 xl:px-28 py-6 sm:py-8 lg:py-10 text-white overflow-hidden">
      {/* Navigation Buttons - Hidden on mobile when only 1 card shows */}
      {newsItems.length > cardsToShow && (
        <>
          <button
            onClick={handlePrev}
            disabled={startIndex === 0}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg backdrop-blur-sm"
            aria-label="Previous news"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={startIndex + cardsToShow >= newsItems.length}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg backdrop-blur-sm"
            aria-label="Next news"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {visible.map((item) => (
          <Link
            key={item._id}
            href={`/news/${item._id}`}
            className="group bg-white/5 hover:bg-white/10 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col backdrop-blur-sm border border-white/10 hover:border-white/20 transform hover:scale-[1.02]"
          >
            <div className="relative overflow-hidden">
              <Image
                src={item.image || "/placeholder.svg?height=200&width=400&text=News+Image"}
                alt={item.title}
                width={400}
                height={200}
                className="object-cover w-full h-40 sm:h-48 group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-3 sm:p-4 flex flex-col flex-grow">
              <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#C9A55C] transition-colors duration-200">
                {item.title}
              </h2>

              <p className="text-xs sm:text-sm text-white/80 font-light line-clamp-3 flex-grow mb-3 leading-relaxed">
                {item.summary || item.content.slice(0, 120) + "..."}
              </p>

              <div className="border-t border-white/20 pt-3 text-xs sm:text-sm text-gray-300 flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{item.view_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    {new Date(item.createdAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination Dots for Mobile */}
      {newsItems.length > cardsToShow && (
        <div className="flex justify-center mt-6 gap-2 sm:hidden">
          {Array.from({ length: Math.ceil(newsItems.length / cardsToShow) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setStartIndex(index * cardsToShow)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                Math.floor(startIndex / cardsToShow) === index ? "bg-[#C9A55C] w-6" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
