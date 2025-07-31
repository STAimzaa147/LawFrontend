"use client"

import Link from "next/link"
import { MessageCircle} from "lucide-react"

export default function HomeButton() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
      {/* Chat AI Button */}
      <Link
        href="/chatai"
        className="group flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-[#C9A55C] hover:bg-[#B8944A] text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl min-w-[140px] sm:min-w-[160px] lg:min-w-[180px]"
      >
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-pulse" />
        <span className="text-sm sm:text-base lg:text-lg">ขอคำปรึกษากฎหมาย AI</span>
      </Link>
    </div>
  )
}
