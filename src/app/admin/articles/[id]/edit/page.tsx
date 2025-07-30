"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { X, Camera, Tag, Trash2 } from "lucide-react" // Added Trash2 icon
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button" // Ensure Button is imported if not already

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

type ArticleItem = {
  _id: string
  title: string
  summary: string
  content: string
  image: string
  createdAt: string
  category?: string
  view_count?: number
  like_count?: number
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

type FormDataType = {
  title: string
  content: string
  category: string
}

const categories = [
  { value: "", label: "เลือกหมวดหมู่" },
  { value: "technology", label: "เทคโนโลยี" },
  { value: "lifestyle", label: "ไลฟ์สไตล์" },
  { value: "business", label: "ธุรกิจ" },
  { value: "health", label: "สุขภาพ" },
  { value: "education", label: "การศึกษา" },
  { value: "travel", label: "ท่องเที่ยว" },
  { value: "food", label: "อาหาร" },
  { value: "sports", label: "กีฬา" },
  { value: "entertainment", label: "บันเทิง" },
  { value: "news", label: "ข่าวสาร" },
  { value: "other", label: "อื่นๆ" },
]

export default function EditArticlePage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    content: "",
    category: "",
  })
  const [currentImage, setCurrentImage] = useState<string | undefined>()
  const [newImage, setNewImage] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false) // For save action
  const [deleting, setDeleting] = useState(false) // For delete action

  // โหลดข้อมูลบทความมาสำหรับแก้ไข
  useEffect(() => {
    const fetchArticle = async () => {
      if (!session?.accessToken) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`${backendUrl}/api/v1/article/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }
        const res: ApiResponse<ArticleItem> = await response.json()
        if (res.success && res.data) {
          const article = res.data
          setFormData({
            title: article.title,
            content: article.content,
            category: article.category || "",
          })
          setCurrentImage(article.image)
        } else {
          toast({
            title: "ไม่พบข้อมูล",
            description: res.message || "ไม่สามารถโหลดบทความได้",
            variant: "destructive",
          })
          router.push("/admin/articles")
        }
      } catch (error: any) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "ไม่สามารถโหลดบทความได้",
          variant: "destructive",
        })
        router.push("/admin/articles")
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [session, id, router, toast])

  // อัปเดตค่าฟอร์มทั่วไป (title, content, category)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // อัปโหลดและ preview รูปภาพใหม่
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({
          title: "ไฟล์ใหญ่เกินไป",
          description: "ขนาดไฟล์ต้องไม่เกิน 10MB",
          variant: "destructive",
        })
        return
      }
      setNewImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setNewImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // ส่งข้อมูลแก้ไขบทความ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      return toast({ title: "กรุณาใส่หัวข้อ", variant: "destructive" })
    }
    if (!formData.category) {
      return toast({ title: "กรุณาเลือกหมวดหมู่", variant: "destructive" })
    }
    if (!formData.content.trim()) {
      return toast({ title: "กรุณาใส่เนื้อหา", variant: "destructive" })
    }
    if (!session?.accessToken) {
      return toast({ title: "คุณยังไม่ได้เข้าสู่ระบบ", variant: "destructive" })
    }
    try {
      setSaving(true)
      const form = new FormData()
      form.append("title", formData.title)
      form.append("content", formData.content)
      form.append("category", formData.category)
      if (newImage) {
        form.append("image", newImage)
      } else if (currentImage === undefined) {
        // ถ้า user ลบรูปภาพเดิม ให้ส่ง empty string เพื่อเคลียร์ใน backend
        form.append("image", "")
      }
      const response = await fetch(`${backendUrl}/api/v1/article/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: form, // Pass FormData directly as body
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      const res: ApiResponse<ArticleItem> = await response.json()
      if (res.success) {
        toast({ title: "อัปเดตสำเร็จ", description: "บทความได้รับการอัปเดตแล้ว" })
        router.push("/admin/articles")
      } else {
        toast({
          title: "ไม่สามารถอัปเดต",
          description: res.message || "เกิดข้อผิดพลาด",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตบทความได้",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // ฟังก์ชันสำหรับลบบทความ
  const handleDeleteArticle = async () => {
    if (!session?.accessToken) {
      return toast({ title: "คุณยังไม่ได้เข้าสู่ระบบ", variant: "destructive" })
    }
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบบทความนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
      return
    }
    try {
      setDeleting(true)
      const response = await fetch(`${backendUrl}/api/v1/article/${id}`, {
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
        toast({ title: "ลบสำเร็จ", description: "บทความถูกลบเรียบร้อยแล้ว" })
        router.push("/admin/articles")
      } else {
        toast({
          title: "ไม่สามารถลบ",
          description: res.message || "เกิดข้อผิดพลาดในการลบบทความ",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบบทความได้",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center text-white text-lg">
        กำลังโหลดบทความ...
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
              <span className="text-white font-semibold text-lg">{session?.user?.name?.charAt(0) || "U"}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{session?.user?.name}</h2>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="หัวข้อบทความของคุณ..."
            className="w-full text-xl font-medium placeholder-gray-400 border-none outline-none bg-transparent text-gray-900"
            required
          />
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            placeholder="เขียนเนื้อหาบทความของคุณที่นี่..."
            className="w-full placeholder-gray-400 border-none outline-none bg-transparent text-gray-700"
            required
          />
          {(newImagePreview || currentImage) && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <Image src={newImagePreview || currentImage!} alt="Preview" fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setNewImage(null)
                  setNewImagePreview(null)
                  setCurrentImage(undefined)
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Tag className="w-5 h-5 text-gray-500" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="flex-1 bg-transparent border-none outline-none text-gray-700 font-medium"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} disabled={cat.value === ""}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <label className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">เพิ่มรูปภาพ</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <div className="flex gap-2">
            {" "}
            {/* Group buttons */}
            <Button
              onClick={handleDeleteArticle}
              disabled={deleting || saving} // Disable if saving or deleting
              variant="destructive"
              className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-full"
            >
              {deleting ? (
                "กำลังลบ..."
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> ลบ
                </>
              )}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={saving || deleting} // Disable if saving or deleting
              className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
