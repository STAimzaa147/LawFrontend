"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { ArrowLeft, FileText, AlertCircle, Upload, X, Send, BookOpen, Tag } from "lucide-react"

type FormData = {
  title: string
  content: string
  category: string
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

// Predefined categories - you can modify these based on your needs
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
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    category: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError("")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError(`ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป ขนาดสูงสุด 10MB`)
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    const fileInput = document.getElementById("image-upload") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError("กรุณาใส่หัวข้อบทความ")
      return
    }
    if (!formData.category) {
      setError("กรุณาเลือกหมวดหมู่บทความ")
      return
    }
    if (!formData.content.trim()) {
      setError("กรุณาใส่เนื้อหาบทความ")
      return
    }

    setLoading(true)
    setError("")

    try {
      const submitFormData = new FormData()
      submitFormData.append("title", formData.title)
      submitFormData.append("content", formData.content)
      submitFormData.append("category", formData.category)
      if (imageFile) {
        submitFormData.append("image", imageFile)
      }

      const res = await fetch(`${backendUrl}/api/v1/article`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: submitFormData,
      })

      const data = await res.json()
      if (data.success) {
        router.push("/articles")
        router.refresh()
      } else {
        setError(data.message || "ไม่สามารถสร้างบทความได้")
      }
    } catch (error) {
      console.error("Error creating article:", error)
      setError("เกิดข้อผิดพลาดในการสร้างบทความ")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">ปฏิเสธการเข้าถึง</h1>
          <p className="text-gray-300 mb-4">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถสร้างบทความได้</p>
          <button
            onClick={() => router.push("/api/auth/signin")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover: transition"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#C9A55C]" />
              <h1 className="text-2xl font-bold text-white">สร้างบทความใหม่</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-2" />
                รูปภาพประกอบบทความ
              </label>
              {imagePreview ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                  <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {imageFile && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {imageFile.name} ({formatFileSize(imageFile.size)})
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    accept="image/*"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <span className="text-lg text-gray-600 font-medium">คลิกเพื่ออัปโหลดรูปภาพ</span>
                      <p className="text-sm text-gray-500 mt-1">หรือลากไฟล์มาวางที่นี่</p>
                    </div>
                    <span className="text-xs text-gray-500">JPG, PNG, GIF (สูงสุด 10MB)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                หัวข้อบทความ *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="ใส่หัวข้อบทความที่น่าสนใจ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#C9A55C] focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">{formData.title.length} ตัวอักษร</p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                หมวดหมู่บทความ *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#C9A55C] focus:border-transparent bg-white"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value} disabled={category.value === ""}>
                    {category.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">เลือกหมวดหมู่ที่เหมาะสมกับเนื้อหาบทความของคุณ</p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                เนื้อหาบทความ *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={15}
                placeholder="เขียนเนื้อหาบทความของคุณที่นี่..."
                className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A55C] focus:border-transparent resize-vertical"
              />
              <p className="text-sm text-gray-500 mt-1">{formData.content.length} ตัวอักษร</p>
            </div>
          </form>
        </div>

        {/* Form Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-8">
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !formData.content.trim() || !formData.category}
              className="flex-1 px-6 py-3 bg-[#C9A55C] text-white rounded-lg hover:bg-[#C9A55C]/80 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  สร้างบทความ
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">คำแนะนำในการสร้างบทความ:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• เลือกหัวข้อที่น่าสนใจและเข้าใจง่าย</li>
            <li>• เลือกหมวดหมู่ที่เหมาะสมกับเนื้อหา</li>
            <li>• ใส่รูปภาพประกอบที่เกี่ยวข้องกับเนื้อหา</li>
            <li>• เขียนเนื้อหาที่มีประโยชน์และครบถ้วน</li>
            <li>• ตรวจสอบการสะกดและไวยากรณ์ก่อนส่ง</li>
            <li>• เนื้อหาควรมีความยาวเหมาะสมและอ่านง่าย</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
