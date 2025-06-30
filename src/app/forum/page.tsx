"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, Plus, MessageCircle, Heart, Eye, ChevronDown } from "lucide-react"
import ForumPostMenu from "@/components/ForumPostMenu"
import ShareButton from "@/components/ShareButton"

type ForumPost = {
  _id: string
  poster_id: {
    _id: string
    name: string
    photo: string
  }
  title: string
  content: string
  image: string
  category: string
  createdAt: string
  comment_count: number
  like_count: number
  view_count: number
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function ForumPage() {
  const [forums, setForums] = useState<ForumPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForums = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${backendUrl}/api/v1/forum`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (data.success) {
          setForums(data.data)
          console.log("fetch forum data : ",data.data);
        }
      } catch (error) {
        console.error("Error fetching forums:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchForums()
  }, [])

  // Extract unique categories from forums
  const categories = Array.from(new Set(forums.map((forum) => forum.category).filter(Boolean)))

  // Filter forums by search term and selected category
  const filteredForums = forums.filter((forum) => {
    const matchesSearch =
      forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forum.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forum.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || forum.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleAddForumClick = () => {
    if (session?.user) {
      router.push("/forum/create")
    } else {
      alert("You must be logged in to add a forum.")
      router.push("/api/auth/signin")
    }
  }

  const handleDeleteForum = async (forumId: string) => {
    const confirmed = confirm("Are you sure you want to delete this forum?")
    if (!confirmed) return

    try {
      const res = await fetch(`${backendUrl}/api/v1/forum/${forumId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (res.ok) {
        setForums((prev) => prev.filter((f) => f._id !== forumId))
      } else {
        alert("Failed to delete forum.")
      }
    } catch (error) {
      console.error("Error deleting forum:", error)
      alert("An error occurred while deleting the forum.")
    }
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setIsDropdownOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Search, Category Filter, and Add Button */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหา"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition flex items-center gap-2 font-medium shadow-sm border min-w-[140px]"
            >
              {selectedCategory === "all" ? "ทุกหมวดหมู่" : selectedCategory}
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
                <div className="py-1">
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedCategory === "all" ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                  >
                    ทุกหมวดหมู่
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedCategory === category ? "bg-blue-50 text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAddForumClick}
            className="bg-white text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition flex items-center gap-2 font-medium shadow-sm border"
          >
            <Plus className="w-5 h-5" />
            ตั้งกระทู้ใหม่
          </button>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== "all" || searchTerm) && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-gray-300 text-sm">กรองโดย:</span>
            {selectedCategory !== "all" && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                หมวดหมู่: {selectedCategory}
                <button onClick={() => setSelectedCategory("all")} className="text-blue-600 hover:text-blue-800 ml-1">
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                ค้นหา: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="text-green-600 hover:text-green-800 ml-1">
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Forum Posts */}
        {loading ? (
          <div className="text-center mt-20 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-50 mx-auto mb-4"></div>
            <p className="text-gray-300">กำลังโหลดกระทู้...</p>
          </div>
        ) : filteredForums.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-lg">
              {searchTerm || selectedCategory !== "all" ? "ไม่พบกระทู้ที���ตรงกับเงื่อนไขการค้นหา" : "ไม่พบกระทู้"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
                className="mt-4 text-blue-400 hover:text-blue-300 underline"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Results count */}
            <div className="text-gray-300 text-sm mb-4">
              พบ {filteredForums.length} กระทู้
              {selectedCategory !== "all" && ` ในหมวดหมู่ "${selectedCategory}"`}
            </div>

            {filteredForums.map((forum) => (
              <div key={forum._id} className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <ForumPostMenu
                    onReport={() => alert("Reported!")}
                    onEdit={() => router.push(`/forum/${forum._id}/edit`)}
                    onDelete={() => handleDeleteForum(forum._id)}
                    isOwner={session?.user?.id === forum.poster_id._id}
                  />
                </div>
                <div onClick={() => router.push(`/forum/${forum._id}`)} className="cursor-pointer">
                  <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
                    <div className="flex gap-6">
                      {/* Image */}
                      {forum.image && (
                        <div className="relative w-48 h-34 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={forum.image || "/placeholder.svg"}
                            alt={forum.title}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Category Badge */}
                        <div className="mb-2">
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {forum.category}
                          </span>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{forum.title}</h2>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{forum.content}</p>

                        {/* Author and Date */}
                        <div className="flex items-center gap-3 mb-4">
                          {forum.poster_id?.photo ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                              <Image
                                src={forum.poster_id.photo}
                                alt={forum.poster_id.name || "Author"}
                                width={32}
                                height={32}
                                unoptimized
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {forum.poster_id?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-600">{forum.poster_id?.name || "Unknown"}</span>
                        </div>

                        {/* Actions and Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Heart className="w-4 h-4" />
                              <span className="text-sm">{forum.like_count}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm">{forum.comment_count}</span>
                            </div>
                            <ShareButton />
                            <div className="flex items-center gap-2 text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">{forum.view_count}</span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            Posted :{" "}
                            {new Date(forum.createdAt).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />}
    </div>
  )
}
