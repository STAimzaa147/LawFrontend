import Image from "next/image"
import HomeButton from "@/components/HomeButton"
import SearchBar from "@/components/SearchBar"
import News from "@/components/News"
import Link from "next/link"
import Article from "@/components/Article"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Banner section with SearchBar and text overlaid */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] my-2 sm:my-5">
        {/* Optimized Next.js Image as background */}
        <Image
          src="/img/Law.png"
          alt="Banner"
          fill
          className="object-cover z-0 blur-[1px] sm:blur-[2px] scale-105 sm:scale-110"
          priority
          unoptimized
        />

        <div className="absolute inset-0 bg-[#353C63]/50 z-5 scale-105 sm:scale-110"></div>

        {/* Search Bar - positioned at top on mobile, center on desktop */}
        <div className="z-20 relative flex justify-center pt-4 sm:pt-8 lg:pt-12">
          <SearchBar />
        </div>

        {/* Hero Text and Button */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full px-4 text-white text-center pt-8 sm:pt-12 lg:pt-16">
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold py-1 sm:py-2 lg:py-3 leading-tight">ให้เราช่วยคุณ</h1>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold py-1 sm:py-2 lg:py-3 leading-tight">
            แก้ปัญหาทางกฎหมายอย่าง <span className="text-[#C9A55C]">มืออาชีพ</span>
          </h1>
          <div className="mt-4 sm:mt-6 lg:mt-8">
            <HomeButton />
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="flex items-center mt-8 sm:mt-12 lg:mt-16 justify-center px-4">
        <div className="w-full max-w-6xl border-t-2 border-white"></div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mx-4 sm:mx-8 lg:mx-28 mt-2 gap-2 sm:gap-0">
        <div className="font-bold text-white text-lg sm:text-xl">ข่าว</div>
        <div>
          <Link
            href="/news"
            className="text-white hover:underline text-sm font-medium z-40 hover:text-[#C9A55C] transition-colors"
          >
            ดูข่าวทั้งหมด →
          </Link>
        </div>
      </div>
      <News />

      {/* Articles Section */}
      <div className="flex items-center mt-8 sm:mt-12 lg:mt-16 justify-center px-4">
        <div className="w-full max-w-6xl border-t-2 border-white"></div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mx-4 sm:mx-8 lg:mx-28 mt-2 gap-2 sm:gap-0">
        <div className="font-bold text-white text-lg sm:text-xl">บทความ</div>
        <div>
          <Link
            href="/articles"
            className="text-white hover:underline text-sm font-medium z-40 hover:text-[#C9A55C] transition-colors"
          >
            ดูบทความทั้งหมด →
          </Link>
        </div>
      </div>
      <Article />
    </main>
  )
}
