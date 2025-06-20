"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, Plus, MessageCircle, Heart, Eye} from "lucide-react"
import ForumPostMenu from "@/components/ForumPostMenu"
import ShareButton from "@/components/ShareButton"

type ForumPost = {
  _id: string
  poster_id: {
    _id: string
    name: string
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
  const { data: session } = useSession()
  const router = useRouter()
  

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/forum`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (data.success) {
          setForums(data.data)
        }
      } catch (error) {
        console.error("Error fetching forums:", error)
      }
    }

    fetchForums()
  }, [])

  // Filter forums locally by title or content matching searchTerm (case insensitive)
  const filteredForums = forums.filter(
    (forum) =>
      forum.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forum.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forum.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  return (
    <div className="min-h-screen bg-slate-800">
      

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {/* Search and Add Button */}
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
          <button
            onClick={handleAddForumClick}
            className="bg-white text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition flex items-center gap-2 font-medium shadow-sm border"
          >
            <Plus className="w-5 h-5" />
            ตั้งกระทู้ใหม่
          </button>
        </div>

        {/* Forum Posts */}
        {filteredForums.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-lg">ไม่พบกระทู้</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                <div
                  onClick={() => router.push(`/forum/${forum._id}`)}
                  className="cursor-pointer"
                >
                  <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
                    <div className="flex gap-6">
                      {/* Image */}
                      {forum.image && (
                        <div className="relative w-36 h-34 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={forum.image || "/placeholder.svg"}
                            alt={forum.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{forum.title}</h2>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{forum.content}</p>

                        {/* Author and Date */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {forum.poster_id?.name?.charAt(0) || "U"}
                            </span>
                          </div>
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
                            <ShareButton/>
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
    </div>
  )
}
