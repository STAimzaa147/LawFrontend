"use client"

import type React from "react"
import { useState } from "react"
import { Heart } from "lucide-react"
import { useSession } from "next-auth/react"

export default function ArticleLikeButton({
  articleId,
  initialCount,
  initiallyLiked,
}: {
  articleId: string
  initialCount: number
  initiallyLiked: boolean
}) {
  const [likeCount, setLikeCount] = useState(initialCount)
  const [liked, setLiked] = useState(initiallyLiked)
  const [loading, setLoading] = useState(false)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const { data: session } = useSession()

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return

    setLoading(true)

    try {
      if (liked) {
        await fetch(`${backendUrl}/api/v1/article/${articleId}/like`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        })
        setLikeCount((prev) => prev - 1)
      } else {
        await fetch(`${backendUrl}/api/v1/article/${articleId}/like`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        })
        setLikeCount((prev) => prev + 1)
      }

      setLiked((prev) => !prev)
    } catch (err) {
      console.error("Failed to like/unlike article:", err)
      // Optionally show a toast or error message
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-2 transition ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
    >
      <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
      <span className="text-sm">{likeCount}</span>
    </button>
  )
}
