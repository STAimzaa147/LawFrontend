"use client"

import type React from "react"

import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import CommentMenu from "@/components/CommentMenu"
import ForumPostMenu from "@/components/ForumPostMenu"
import LikeButton from "@/components/LikeButton"
import { Eye, Heart } from "lucide-react"
import ShareButton from "@/components/ShareButton"
import ReportForm from "@/components/ReportForm"
import ReportComment from "@/components/ReportComment"

type ForumPost = {
  _id: string
  poster_id: { _id: string; name: string }
  title: string
  content: string
  image: string
  category: string
  createdAt: string
  comment_count: number
  like_count: number
  view_count: number
}

type Comment = {
  _id: string
  user_id: { _id: string; name: string; photo: string}
  content: string
  createdAt: string
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function ForumPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()

  const [forum, setForum] = useState<ForumPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [showCommentBox, setShowCommentBox] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [recommendedForums, setRecommendedForums] = useState<ForumPost[]>([])
  const [initiallyLiked, setInitiallyLiked] = useState(false)
  const [likeCheckLoading, setLikeCheckLoading] = useState(true)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportCommentModalOpen, setReportCommentModalOpen] = useState(false)
  const [commentToReport, setCommentToReport] = useState<Comment | null>(null)

  useEffect(() => {
    if (showCommentBox && commentInputRef.current) {
      commentInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [showCommentBox])

  useEffect(() => {
    const fetchForum = async () => {
      const res = await fetch(`${backendUrl}/api/v1/forum/${params.id}`)
      const data = await res.json()
      if (data.success) setForum(data.data)
      else notFound()
    }

    const fetchComments = async () => {
      const res = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment`)
      const data = await res.json()
      if (data.comments) setComments(data.comments)
    }

    const checkIfLiked = async () => {
      if (!session?.accessToken) {
        setLikeCheckLoading(false)
        return
      }

      try {
        const res = await fetch(`${backendUrl}/api/v1/forum/${params.id}/like`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        // Based on your backend logic:
        // - 400 status means already liked
        // - 200 status means can like (not liked yet)
        if (res.ok) {
        const data = await res.json()
        setInitiallyLiked(data.liked || false);
    }
      } catch (error) {
        console.error("Failed to check like status:", error)
      } finally {
        setLikeCheckLoading(false)
      }
    }

    fetchForum()
    fetchComments()
    checkIfLiked()
  }, [params.id, session?.accessToken])

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/forum?limit=5&sort=latest`)
        const data = await res.json()
        if (data.success) setRecommendedForums(data.data)
      } catch (error) {
        console.error("Failed to fetch recommended forums:", error)
      }
    }
    fetchRecommended()
  }, [])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      alert("You must be logged in to comment.")
      router.push("/api/auth/signin")
      return
    }

    if (!newComment.trim()) return

    const url = editingCommentId
      ? `${backendUrl}/api/v1/forum/${params.id}/comment/${editingCommentId}`
      : `${backendUrl}/api/v1/forum/${params.id}/comment`

    const method = editingCommentId ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ content: newComment }),
    })

    if (res.ok) {
      setNewComment("")
      setEditingCommentId(null)
      setShowCommentBox(false)

      // Refresh comments
      const commentsRes = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment`)
      const data = await commentsRes.json()
      if (data.success) {
        setComments(data.comments)
      }
    } else {
      alert("Failed to post comment.")
    }
  }

  const handleEdit = (comment: Comment) => {
    setShowCommentBox(true)
    setNewComment(comment.content)
    setEditingCommentId(comment._id)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    const res = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    })

    if (res.ok) {
      // Refresh comments
      const commentsRes = await fetch(`${backendUrl}/api/v1/forum/${params.id}/comment`)
      const data = await commentsRes.json()
      if (data.success) {
        setComments(data.comments)
      }
    } else {
      alert("Failed to delete comment.")
    }
  }

  const handleReportSubmit = async (reason: string, details: string) => {
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนรายงาน")
      router.push("/api/auth/signin")
      return
    }

    try {
      const res = await fetch(`${backendUrl}/api/v1/forum/${forum?._id}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ reason, details }),
      })

      if (!res.ok) throw new Error("Failed to report")

      alert("รายงานถูกส่งเรียบร้อย ขอบคุณที่แจ้งให้เราทราบ")
    } catch (error) {
      console.error("Report error:", error)
      alert("ส่งรายงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    }
  }

  const handleReportCommentSubmit = async (commentId: string, reason: string, details: string) => {
  if (!session) {
    alert("กรุณาเข้าสู่ระบบก่อนรายงาน")
    router.push("/api/auth/signin")
    return
  }

  try {
    const res = await fetch(`${backendUrl}/api/v1/comment/${commentId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ reason, details }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || "Failed to send comment report.")
    }

    alert("ส่งรายงานความคิดเห็นเรียบร้อยแล้ว")
  } catch (error) {
    console.error("Failed to report comment:", error)
    alert("เกิดข้อผิดพลาดในการส่งรายงานความคิดเห็น")
  }
}


  if (!forum) return <p className="text-center p-6 my-10">Loading...</p>

  const filteredRecommended = recommendedForums.filter((rec) => rec._id !== forum._id)

  return (
    <>
      {/* Main forum post */}
      <div className="max-w-5xl mx-auto mt-24 p-6 bg-white rounded shadow">
        <div className="relative">
          <div className="absolute top-0 right-0">
            <ForumPostMenu
              isOwner={session?.user?.id === forum.poster_id._id}
              onEdit={() => router.push(`/forum/${forum._id}/edit`)}
              onDelete={async () => {
                const confirmed = confirm("Are you sure you want to delete this post?")
                if (!confirmed) return

                try {
                  const res = await fetch(`${backendUrl}/api/v1/forum/${forum._id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${session?.accessToken}`,
                    },
                  })

                  if (res.ok) {
                    alert("Forum post deleted successfully.")
                    router.push("/forum")
                  } else {
                    alert("Failed to delete forum post.")
                  }
                } catch (error) {
                  console.error("Error deleting forum post:", error)
                  alert("An error occurred while deleting the forum post.")
                }
              }}
              onReport={() => setReportModalOpen(true)}
            />
          </div>
          <h1 className="text-3xl text-black font-bold mb-4">{forum.title}</h1>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-gray-600 text-sm mb-2">
              Posted by {forum.poster_id.name} on{" "}
              {new Date(forum.createdAt).toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
            <div className="text-blue-700 font-medium">{forum.category}</div>
          </div>

          {/* Like Button */}
          <div className="flex items-center gap-4">
            {session && !likeCheckLoading && (
              <LikeButton forumId={forum._id} initialCount={forum.like_count} initiallyLiked={initiallyLiked} />
            )}
            {!session && (
              <div className="flex items-center gap-2 text-gray-500">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{forum.like_count}</span>
              </div>
            )}
            <ShareButton/>
            <div className="flex items-center gap-2 text-gray-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{forum.view_count}</span>
            </div>
            
          </div>
        </div>

        {forum.image && (
          <div className="relative w-full max-w-2xl h-80 mx-auto rounded-md overflow-hidden mb-6">
            <Image
              src={forum.image || "/placeholder.svg"}
              alt={forum.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1024px"
            />
          </div>
        )}

        <p className="text-gray-800 px-20 mb-10 whitespace-pre-line">{forum.content}</p>

        {/* Comments */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-black font-semibold">({forum.comment_count}) ความคิดเห็น</h2>
            <button
              onClick={() => setShowCommentBox((prev) => !prev)}
              className="px-10 py-2 text-sm text-white bg-[#353C63]/80 rounded-3xl hover:underline"
            >
              + แสดงความคิดเห็น
            </button>
          </div>

          {comments.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีความคิดเห็น</p>
          ) : (
            <ul className="space-y-6">
              {comments.map((comment) =>
                comment && comment.content ? (
                  <li key={comment._id} className="border-t pt-4 relative">
                  {/* User Info: Image + Name + Date */}
                  <div className="flex items-center gap-2 mb-1">
                    {comment.user_id?.photo ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={comment.user_id.photo}
                          alt={comment.user_id.name || "User"}
                          width={32}
                          height={32}
                          unoptimized
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {comment.user_id?.name?.charAt(0) || "U"}
                      </div>
                    )}

                    <span className="text-sm text-gray-500">
                      {comment.user_id?.name || "Unknown"} on{" "}
                      {new Date(comment.createdAt).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <p className="text-gray-800 mt-2">{comment.content}</p>

                  {/* Comment Menu */}
                  <div className="absolute top-2 right-2">
                    <CommentMenu
                      isOwner={session?.user?.id === comment.user_id?._id}
                      onEdit={() => handleEdit(comment)}
                      onDelete={() => handleDelete(comment._id)}
                      onReport={() => {
                        if (!session) {
                          alert("กรุณาเข้าสู่ระบบก่อนแจ้งรายงาน");
                          router.push("/api/auth/signin");
                          return;
                        }
                        setCommentToReport(comment);
                        setReportCommentModalOpen(true);
                      }}
                    />
                  </div>
                </li>
                ) : null,
              )}
            </ul>
          )}
        </section>
      </div>

      {/* Comment input */}
      {showCommentBox && (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
          <h3 className="text-xl font-semibold text-black mb-2">
            {editingCommentId ? "แก้ไขความคิดเห็น" : "เขียนแสดงความคิดเห็น"}
          </h3>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border rounded p-2 text-sm text-black"
              rows={4}
              placeholder="เขียนแสดงความคิดเห็นตรงนี้..."
            />
            <div className="flex justify-end mt-2 gap-2">
              {(editingCommentId || showCommentBox) && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentBox(false)
                    setNewComment("")
                    setEditingCommentId(null)
                  }}
                  className="text-sm px-4 py-1 rounded-3xl bg-gray-300 text-black hover:bg-gray-400"
                >
                  ยกเลิก
                </button>
              )}
              <button
                type="submit"
                className="text-sm px-4 py-1 rounded-3xl bg-[#353C63]/80 text-white hover:bg-green-700"
              >
                {editingCommentId ? "บันทึก" : "เพิ่ม"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recommended forums */}
      <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded shadow">
        <h3 className="text-xl text-black font-semibold mb-4">กระทู้แนะนำ</h3>
        {filteredRecommended.length === 0 ? (
          <p className="text-gray-500">ไม่มีกระทู้แนะนำ</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredRecommended.map((f) => (
              <li key={f._id} className="flex items-start gap-3 py-3">
                {f.image && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={f.image || "/placeholder.svg"}
                      alt={f.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <a
                    href={`/forum/${f._id}`}
                    className="block text-black hover:underline font-medium line-clamp-2"
                    title={f.title}
                  >
                    {f.title}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">{f.category}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ReportForm
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={async (reason, details) => {
          await handleReportSubmit(reason, details)
          setReportModalOpen(false)
        }}
        forumTitle={forum?.title || ""}
      />
      {commentToReport && (
        <ReportComment
          isOpen={reportCommentModalOpen}
          onClose={() => {
            setReportCommentModalOpen(false);
            setCommentToReport(null);
          }}
          onSubmit={handleReportCommentSubmit}
          commentContent={commentToReport.content}
          commentId={commentToReport._id} // <-- Add this line
        />
      )}
    </>
  )
}
