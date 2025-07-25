"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface ArticleItem {
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

export default function AdminArticlesPage() {
  const { data: session } = useSession()
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchArticles = async () => {
    if (!session?.accessToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // Reverted to native fetch and added Authorization header
      const response = await fetch(`${backendUrl}/api/v1/article`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`, // Correct way to pass token
        },
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setArticles(data.data)
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลบทความได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching articles:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลบทความ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchArticles()
    }
  }, [session, toast]) // Added toast to dependency array

  const handleDeleteArticle = async (articleId: string) => {
    if (!session?.accessToken) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบทความนี้?")) return

    try {
      // FIX: Changed from apiFetch to native fetch for DELETE request
      const response = await fetch(`${backendUrl}/api/v1/article/${articleId}`, {
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

      // No need to parse response if backend sends no content for success, but good practice to check
      // const data = await response.json(); 

      toast({
        title: "สำเร็จ",
        description: "ลบบทความเรียบร้อยแล้ว",
      })
      fetchArticles() // Refresh list
    } catch (error: any) {
      console.error("Error deleting article:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบบทความได้",
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
      <div className="flex items-center justify-center min-h-screen bg-[#242940] text-white">กำลังโหลดข้อมูลบทความ...</div>
    )
  }

  return (
    <div className="min-h-screen bg-[#242940] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">การจัดการบทความ</h1>
          <Link href="/admin/articles/create">
            <Button className="bg-white text-slate-700 hover:bg-gray-100">
              <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มบทความใหม่
            </Button>
          </Link>
        </div>
        {articles.length === 0 ? (
          <p className="text-center text-gray-300">ไม่พบข้อมูลบทความ</p>
        ) : (
          <div className="grid gap-6">
            {articles.map((article) => (
              <Card key={article._id} className="bg-white rounded-xl shadow-lg p-6">
                <CardContent className="p-0">
                  {" "}
                  {/* Removed default padding and flex from CardContent */}
                  {/* Avatar and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      {article.poster_id?.photo ? (
                        <Image
                          src={article.poster_id.photo || "/placeholder.svg"}
                          alt={article.poster_id?.name || "User"}
                          fill // Use fill to make image cover the parent div
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-400 flex items-center justify-center">
                          <span className="text-white text-2xl font-medium">{article.poster_id?.name?.charAt(0).toUpperCase() || "U"}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{article.poster_id?.name || "ไม่ระบุชื่อ"}</span>
                  </div>
                  {/* Title, Content, Date, and Buttons - all indented */}
                  <div className="ml-[80px]">
                    {" "}
                    {/* This div now contains all the indented content */}
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h2>
                    <p className="text-gray-700 mb-3 leading-relaxed">{truncateContent(article.content, 150)}</p>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-gray-500">
                        โพสต์เมื่อ :{" "}
                        {new Date(article.createdAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex gap-3">
                        <Link href={`/admin/articles/${article._id}/edit`}>
                          <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-full">
                            <Pencil className="mr-2 h-4 w-4" /> แก้ไข
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteArticle(article._id)}
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