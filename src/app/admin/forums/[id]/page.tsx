"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { X } from 'lucide-react'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface ForumItem {
  _id: string
  title: string
  content: string
  category: string
  image?: string
  poster_id: {
    _id: string
    name: string
  }
  view_count: number
  comment_count: number
  like_count: number
  createdAt: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export default function AdminForumDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const router = useRouter()
  const [forum, setForum] = useState<ForumItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false) // For delete action
  const { toast } = useToast()

  useEffect(() => {
    const fetchForum = async () => {
      if (!session?.accessToken || !id) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        // FIX: Changed from apiFetch to native fetch for GET request
        const response = await fetch(`${backendUrl}/api/v1/forum/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const res: ApiResponse<ForumItem> = await response.json()

        if (res.success && res.data) {
          setForum(res.data)
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: res.message || "ไม่พบข้อมูลกระทู้",
            variant: "destructive",
          })
          router.push("/admin/forums")
        }
      } catch (error: any) {
        console.error("Error fetching forum:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้",
          variant: "destructive",
        })
        router.push("/admin/forums")
      } finally {
        setLoading(false)
      }
    }
    fetchForum()
  }, [session, id, router, toast])

  const handleDeleteForum = async () => {
    if (!session?.accessToken || !forum) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบกระทู้นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
      return
    }
    setSaving(true)
    try {
      // FIX: Changed from apiFetch to native fetch for DELETE request
      const response = await fetch(`${backendUrl}/api/v1/forum/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const res: ApiResponse<any> = await response.json()

      if (res.success) {
        toast({
          title: "สำเร็จ",
          description: "ลบกระทู้เรียบร้อยแล้ว",
        })
        router.push("/admin/forums")
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: res.message || "ไม่สามารถลบกระทู้ได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error deleting forum:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบกระทู้ได้",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center text-white text-lg z-50">
        กำลังโหลดรายละเอียดกระทู้...
      </div>
    )
  }

  if (!forum) {
    return (
      <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center text-red-500 text-lg z-50">
        ไม่พบกระทู้
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden mt-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
              {/* Display first character of poster's name */}
              <span className="text-white font-semibold text-lg">{forum.poster_id?.name?.charAt(0) || "U"}</span>
            </div>
            <div>
              {/* Display poster's name */}
              <h2 className="text-lg font-semibold text-gray-900">{forum.poster_id?.name || "ไม่ระบุผู้โพสต์"}</h2>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-xl font-medium text-gray-900">{forum.title}</h1>
          <p className="text-gray-700 whitespace-pre-wrap">{forum.content}</p>
          {forum.image && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <Image src={forum.image || "/placeholder.svg"} alt="Forum Image" fill unoptimized className="object-cover" />
            </div>
          )}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-500 font-medium">หมวดหมู่:</span>
            <span className="text-gray-700">{forum.category}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex flex-col">
              <span className="font-medium text-gray-500">ผู้โพสต์:</span>
              <span>{forum.poster_id?.name || "ไม่ระบุ"}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-500">ยอดวิว:</span>
              <span>{forum.view_count}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-500">ความคิดเห็น:</span>
              <span>{forum.comment_count}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-500">ยอดไลค์:</span>
              <span>{forum.like_count}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-500">วันที่สร้าง:</span>
              <span>{new Date(forum.createdAt).toLocaleDateString("th-TH")}</span>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-100 bg-gray-50">
          <Button
            onClick={handleDeleteForum}
            disabled={saving}
            variant="destructive"
            className="px-6 py-2 rounded-full font-medium"
          >
            {saving ? "กำลังลบ..." : "ลบกระทู้"}
          </Button>
        </div>
      </div>
    </div>
  )
}