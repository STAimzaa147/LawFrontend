"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2 } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface CommentItem {
  _id: string
  content: string
  user_id: {
    _id: string
    name: string
  }
  forum_id: string // Just the ID, will link to forum detail
  createdAt: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export default function AdminCommentsPage() {
  const { data: session } = useSession()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchComments = async () => {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      // FIX: Changed from apiFetch to native fetch for GET request
      const response = await fetch(`${backendUrl}/api/v1/comments`, {
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

      const data: ApiResponse<CommentItem[]> = await response.json()

      if (data.success) {
        setComments(data.data || [])
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถดึงข้อมูลความคิดเห็นได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching comments:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลความคิดเห็น",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchComments()
    }
  }, [session])

  const handleDeleteComment = async (commentId: string, forumId: string) => {
    if (!session?.accessToken) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบความคิดเห็นนี้?")) return
    try {
      // FIX: Changed from apiFetch to native fetch for DELETE request
      const response = await fetch(`${backendUrl}/api/v1/forum/${forumId}/comment/${commentId}`, {
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
          description: "ลบความคิดเห็นเรียบร้อยแล้ว",
        })
        fetchComments() // Refresh list
      } else {
        throw new Error(res.message || "ลบไม่สำเร็จ")
      }
    } catch (error: any) {
      console.error("Error deleting comment:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบความคิดเห็นได้",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูลความคิดเห็น...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">การจัดการความคิดเห็น</h1>
      <Card>
        <CardHeader>
          <CardTitle>รายการความคิดเห็นทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <p className="text-center text-gray-500">ไม่พบข้อมูลความคิดเห็น</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เนื้อหา</TableHead>
                    <TableHead>ผู้แสดงความคิดเห็น</TableHead>
                    <TableHead>กระทู้ที่เกี่ยวข้อง</TableHead>
                    <TableHead>วันที่สร้าง</TableHead>
                    <TableHead className="text-right">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment._id}>
                      <TableCell className="font-medium max-w-xs truncate">{comment.content}</TableCell>
                      <TableCell>{comment.user_id?.name || "ไม่ระบุ"}</TableCell>
                      <TableCell>
                        <Link href={`/admin/forums/${comment.forum_id}`} className="text-blue-600 hover:underline">
                          ดูกระทู้</Link>
                      </TableCell>
                      <TableCell>{new Date(comment.createdAt).toLocaleDateString("th-TH")}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">เปิดเมนู</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteComment(comment._id, comment.forum_id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> ลบความคิดเห็น</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}