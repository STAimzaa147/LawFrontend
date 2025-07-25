"use client"

import type React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { X, Camera, Tag } from 'lucide-react'
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

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

export default function CreateArticlePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    content: "",
    category: "",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      return toast({
        title: "กรุณาใส่หัวข้อ",
        variant: "destructive",
      })
    }
    if (!formData.category) {
      return toast({
        title: "กรุณาเลือกหมวดหมู่",
        variant: "destructive",
      })
    }
    if (!formData.content.trim()) {
      return toast({
        title: "กรุณาใส่เนื้อหา",
        variant: "destructive",
      })
    }
    if (!session?.accessToken) {
      return toast({
        title: "คุณยังไม่ได้เข้าสู่ระบบ",
        variant: "destructive",
      })
    }

    try {
      setLoading(true)
      const form = new FormData()
      form.append("title", formData.title)
      form.append("content", formData.content)
      form.append("category", formData.category)
      if (image) {
        form.append("image", image)
      }

      // FIX: Changed from apiFetch to native fetch
      const response = await fetch(`${backendUrl}/api/v1/article`, {
        method: "POST",
        headers: {
          // When sending FormData, fetch automatically sets Content-Type: multipart/form-data
          // Do NOT manually set Content-Type for FormData, as it will break the boundary
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: form, // Pass FormData directly as body
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: "สร้างสำเร็จ",
          description: "บทความของคุณถูกสร้างเรียบร้อยแล้ว",
        })
        router.push("/admin/articles")
      } else {
        toast({
          title: "ไม่สำเร็จ",
          description: data.message || "ไม่สามารถสร้างบทความได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งบทความได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
          {imagePreview && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  setImagePreview(null)
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
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
          >
            {loading ? "กำลังสร้าง..." : "สร้างบทความ"}
          </button>
        </div>
      </div>
    </div>
  )
}