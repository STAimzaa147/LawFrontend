"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, MessageCircle, Heart } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface ForumItem {
  _id: string
  title: string
  content: string // Assuming content is available for snippet
  category: string
  poster_id: {
    _id: string
    name: string
    photo?: string // Added photo property for avatar
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

export default function AdminForumsPage() {
  const { data: session } = useSession()
  const [forums, setForums] = useState<ForumItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchForums = async () => {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      // FIX: Changed from apiFetch to native fetch for GET request
      const response = await fetch(`${backendUrl}/api/v1/forum`, {
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

      const data: ApiResponse<ForumItem[]> = await response.json()

      if (data.success) {
        // Sort the forums list from newest to oldest
        const sortedForums = (data.data || []).sort((a: ForumItem, b: ForumItem) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setForums(sortedForums)
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถดึงข้อมูลกระทู้ได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching forums:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchForums()
    }
  }, [session])

  const handleDeleteForum = async (forumId: string) => {
    if (!session?.accessToken) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบกระทู้นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) return
    try {
      // FIX: Changed from apiFetch to native fetch for DELETE request
      const response = await fetch(`${backendUrl}/api/v1/forum/${forumId}`, {
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
        fetchForums() // Refresh list
      } else {
        throw new Error(res.message || "ลบไม่สำเร็จ")
      }
    } catch (error: any) {
      console.error("Error deleting forum:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบกระทู้ได้",
        variant: "destructive",
      })
    }
  }

  const truncateContent = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#242940] text-white">กำลังโหลดข้อมูลกระทู้...</div>
    )
  }

  return (
    <div className="min-h-screen bg-[#242940] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">การจัดการกระทู้</h1>
          {/* If you need an "Add New Forum" button, you can add it here */}
          {/* <Link href="/admin/forums/create">            <Button className="bg-white text-slate-700 hover:bg-gray-100">              <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มกระทู้ใหม่            </Button>          </Link> */}
        </div>
        {forums.length === 0 ? (
          <p className="text-center text-gray-300">ไม่พบข้อมูลกระทู้</p>
        ) : (
          <div className="grid gap-6">
            {forums.map((forum) => (
              <Card key={forum._id} className="bg-white rounded-xl shadow-lg p-6">
                <CardContent className="p-0">
                  {/* Avatar and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      {forum.poster_id?.photo ? (
                        <Image
                          src={forum.poster_id.photo || "/placeholder.svg"}
                          alt={forum.poster_id?.name || "User"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-400 flex items-center justify-center">
                          <span className="text-white text-2xl font-medium">
                            {forum.poster_id?.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {forum.poster_id?.name || "ไม่ระบุชื่อ"}
                    </span>
                  </div>
                  {/* Title, Content, Stats, Date, and Buttons - all indented */}
                  <div className="ml-[80px]">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{forum.title}</h2>
                    <p className="text-gray-700 mb-3 leading-relaxed">{truncateContent(forum.content || "", 150)}</p>
                    {/* Stats (View, Comment, Like Counts) */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" /> {forum.like_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" /> {forum.comment_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {forum.view_count}
                      </div>
                    </div>
                    {/* Posted Date and Buttons */}
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-gray-500">
                        โพสต์เมื่อ :{" "}
                        {new Date(forum.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex gap-3">
                        <Link href={`/admin/forums/${forum._id}`}>
                          <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-full">
                            <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียด
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteForum(forum._id)}
                          className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-full"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> ลบกระทู้
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}