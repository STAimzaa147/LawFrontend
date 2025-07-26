"use client"

import { useState, useEffect, useRef } from "react"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ArticleMenu({
  articleId,
  authorId,
}: {
  articleId: string
  authorId: string
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const router = useRouter()

  // Check if current user is the owner
  const isOwner = session?.user?.id === authorId

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleEdit = () => {
    // Navigate to edit page or implement edit logic
    router.push(`/articles/${articleId}/edit`)
    setOpen(false)
  }

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบทความนี้?")) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/article/${articleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (response.ok) {
        alert("ลบบทความเรียบร้อยแล้ว")
        router.push("/articles")
        router.refresh();
      } else {
        alert("เกิดข้อผิดพลาดในการลบบทความ")
      }
    } catch (error) {
      console.error("Error deleting article:", error)
      alert("เกิดข้อผิดพลาดในการลบบทความ")
    }
    setOpen(false)
  }

  // Don't render if user is not the owner
  if (!isOwner) return null

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Open article menu"
      >
        <MoreHorizontal size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <button
            onClick={handleEdit}
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit size={16} />
            แก้ไขบทความ
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            ลบบทความ
          </button>
        </div>
      )}
    </div>
  )
}
