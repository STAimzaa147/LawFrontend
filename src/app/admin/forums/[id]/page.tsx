"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { X, Trash2 } from "lucide-react" // Added Trash2 icon

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

// Reusing the Comment type from the ForumPage component
type Comment = {
  _id: string
  user_id: { _id: string; name: string; photo: string }
  content: string
  createdAt: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  comments?: Comment[] // Added for comments API response
}

export default function AdminForumDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const router = useRouter()
  const [forum, setForum] = useState<ForumItem | null>(null)
  const [comments, setComments] = useState<Comment[]>([]) // State for comments
  const [loading, setLoading] = useState(true)
  const [loadingComments, setLoadingComments] = useState(true) // State for comments loading
  const [saving, setSaving] = useState(false) // For delete forum action
  const [deletingComment, setDeletingComment] = useState<string | null>(null) // For deleting individual comments
  const { toast } = useToast()

  useEffect(() => {
    const fetchForumAndComments = async () => {
      if (!session?.accessToken || !id) {
        setLoading(false)
        setLoadingComments(false)
        return
      }
      setLoading(true)
      setLoadingComments(true)
      try {
        // Fetch Forum Details
        const forumResponse = await fetch(`${backendUrl}/api/v1/forum/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        if (!forumResponse.ok) {
          const errorData = await forumResponse.json()
          throw new Error(errorData.message || `HTTP error! status: ${forumResponse.status}`)
        }
        const forumRes: ApiResponse<ForumItem> = await forumResponse.json()
        if (forumRes.success && forumRes.data) {
          setForum(forumRes.data)
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: forumRes.message || "ไม่พบข้อมูลกระทู้",
            variant: "destructive",
          })
          router.push("/admin/forums")
        }

        // Fetch Comments
        const commentsResponse = await fetch(`${backendUrl}/api/v1/forum/${id}/comment`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        if (!commentsResponse.ok) {
          const errorData = await commentsResponse.json()
          throw new Error(errorData.message || `HTTP error! status: ${commentsResponse.status}`)
        }
        const commentsRes: ApiResponse<Comment[]> = await commentsResponse.json()
        if (commentsRes.comments) {
          setComments(commentsRes.comments)
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: commentsRes.message || "ไม่สามารถดึงความคิดเห็นได้",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error("Error fetching forum or comments:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้หรือความคิดเห็น",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setLoadingComments(false)
      }
    }
    fetchForumAndComments()
  }, [session, id, router, toast])

  const handleDeleteForum = async () => {
    if (!session?.accessToken || !forum) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบกระทู้นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`${backendUrl}/api/v1/forum/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
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

  const handleDeleteComment = async (commentId: string) => {
    if (!session?.accessToken) {
      toast({
        title: "ข้อผิดพลาด",
        description: "คุณต้องเข้าสู่ระบบเพื่อลบความคิดเห็น",
        variant: "destructive",
      })
      return
    }
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบความคิดเห็นนี้?")) {
      return
    }
    setDeletingComment(commentId)
    try {
      const response = await fetch(`${backendUrl}/api/v1/forum/${id}/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const res: ApiResponse<any> = await response.json()
      if (res.success) {
        toast({
          title: "สำเร็จ",
          description: "ลบความคิดเห็นเรียบร้อยแล้ว",
        })
        // Update comments state to remove the deleted comment
        setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId))
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: res.message || "ไม่สามารถลบความคิดเห็นได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error deleting comment:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการลบความคิดเห็น",
        variant: "destructive",
      })
    } finally {
      setDeletingComment(null)
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
              <Image
                src={forum.image || "/placeholder.svg"}
                alt="Forum Image"
                fill
                unoptimized
                className="object-cover"
              />
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

          {/* Comments Section */}
          <section className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ความคิดเห็น ({comments.length})</h2>
            {loadingComments ? (
              <p className="text-gray-500">กำลังโหลดความคิดเห็น...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีความคิดเห็นสำหรับกระทู้นี้</p>
            ) : (
              <ul className="space-y-6">
                {comments.map((comment) => (
                  <li key={comment._id} className="relative p-4 bg-gray-50 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      {comment.user_id?.photo ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={comment.user_id.photo || "/placeholder.svg"}
                            alt={comment.user_id.name || "User"}
                            width={40}
                            height={40}
                            unoptimized
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {comment.user_id?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{comment.user_id?.name || "ไม่ระบุผู้ใช้"}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap pl-12">{comment.content}</p>
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteComment(comment._id)}
                        disabled={deletingComment === comment._id}
                        className="text-red-500 hover:bg-red-100"
                        aria-label={`ลบความคิดเห็นของ ${comment.user_id?.name || "ไม่ระบุผู้ใช้"}`}
                      >
                        {deletingComment === comment._id ? (
                          <span className="animate-spin">...</span> // Simple loading indicator
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-100 bg-gray-50">
          <Button
            onClick={handleDeleteForum}
            disabled={saving}
            variant="destructive"
            className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-full"
          >
            <Trash2 className="mr-2 h-4 w-4" /> ลบกระทู้
          </Button>
        </div>
      </div>
    </div>
  )
}
