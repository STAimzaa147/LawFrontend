"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card" // Import CardContent
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface NewsItem {
  _id: string
  title: string
  content: string // Added content to display snippet
  category: string
  poster_id: {
    _id: string
    name: string
    photo?: string // Added photo property
  }
  createdAt: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export default function AdminNewsPage() {
  const { data: session } = useSession()
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchNews = async () => {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      // FIX: Changed from apiFetch to native fetch for GET request
      const response = await fetch(`${backendUrl}/api/v1/news`, {
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

      const data: ApiResponse<NewsItem[]> = await response.json()

      if (data.success) {
        // Sort the news list from newest to oldest
        const sortedNews = (data.data || []).sort((a: NewsItem, b: NewsItem) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setNewsList(sortedNews)
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถดึงข้อมูลข่าวสารได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching news:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลข่าวสาร",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchNews()
    }
  }, [session])

  const handleDeleteNews = async (newsId: string) => {
    if (!session?.accessToken) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข่าวสารนี้?")) return
    try {
      // FIX: Changed from apiFetch to native fetch for DELETE request
      const response = await fetch(`${backendUrl}/api/v1/news/${newsId}`, {
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
          description: "ลบข่าวสารเรียบร้อยแล้ว",
        })
        fetchNews() // Refresh list
      } else {
        throw new Error(res.message || "ลบไม่สำเร็จ")
      }
    } catch (error: any) {
      console.error("Error deleting news:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบข่าวสารได้",
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
      <div className="flex items-center justify-center min-h-screen bg-[#242940] text-white">กำลังโหลดข้อมูลข่าวสาร...</div>
    )
  }

  return (
    <div className="min-h-screen bg-[#242940] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">การจัดการข่าวสาร</h1>
          <Link href="/admin/news/create">
            <Button className="bg-white text-slate-700 hover:bg-gray-100">
              <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มข่าวสารใหม่
            </Button>
          </Link>
        </div>
        {newsList.length === 0 ? (
          <p className="text-center text-gray-300">ไม่พบข้อมูลข่าวสาร</p>
        ) : (
          <div className="grid gap-6">
            {newsList.map((newsItem) => (
              <Card key={newsItem._id} className="bg-white rounded-xl shadow-lg p-6">
                <CardContent className="p-0">
                  {/* Avatar and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      {newsItem.poster_id?.photo ? (
                        <Image
                          src={newsItem.poster_id.photo || "/placeholder.svg"}
                          alt={newsItem.poster_id?.name || "User"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-400 flex items-center justify-center">
                          <span className="text-white text-2xl font-medium">
                            {newsItem.poster_id?.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {newsItem.poster_id?.name || "ไม่ระบุชื่อ"}
                    </span>
                  </div>
                  {/* Title, Content, Date, and Buttons - all indented */}
                  <div className="ml-[80px]">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{newsItem.title}</h2>
                    <p className="text-gray-700 mb-3 leading-relaxed">{truncateContent(newsItem.content, 150)}</p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-gray-500">
                        โพสต์เมื่อ :{" "}
                        {new Date(newsItem.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex gap-3">
                        <Link href={`/admin/news/${newsItem._id}/edit`}>
                          <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-full">
                            <Pencil className="mr-2 h-4 w-4" /> แก้ไข
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteNews(newsItem._id)}
                          className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-full"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> ลบ
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