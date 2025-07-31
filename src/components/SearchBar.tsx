"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function SearchBar() {
  const [search, setSearch] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLFormElement>(null)

  const router = useRouter()

  const recommendations = [
    "คดีแพ่ง",
    "คดีอาญา",
    "คดีครอบครัว",
    "คดีแรงงาน",
    "คดีผู้บริโภค",
    "คดีที่เกี่ยวกับที่อยู่อาศัย",
    "คดีละเมิด / หมิ่นประมาท",
    "คดีธุรกิจและการขอสิทธิบัตร",
    "คดีซื้อขายอสังหาริมทรัพย์",
    "คดีออนไลน์",
    "คดีต่างด้าว / ตรวจคนเข้าเมือง",
    "คดีที่ดินและทรัพย์สิน",
  ]

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    setIsFocused(false)
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      handleSearch(search)
    }
  }

  return (
    <form
      className="p-4  w-full max-w-4xl relative place-self-center z-10"
      ref={wrapperRef}
      onSubmit={handleSubmit}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          placeholder="ค้นหาคดี"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        />

        {isFocused && (
          <ul className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-md max-h-60 overflow-y-auto">
            {recommendations
              .filter((item) => item.includes(search))
              .map((item, index) => (
                <li
                  key={index}
                  className="px-3 sm:px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-xl text-gray-800 z-20 text-sm sm:text-base"
                  onClick={() => handleSearch(item)}
                >
                  {item}
                </li>
              ))}
          </ul>
        )}
      </div>
    </form>
  )
}
