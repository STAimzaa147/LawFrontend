"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Camera, Tag } from "lucide-react"
import Image from "next/image"

export default function CreateForum() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("คำถามกฎหมาย")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { data: session } = useSession()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImage(null)
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const hasImage = !!image
    let response

    if (hasImage) {
      // Use FormData when image is included
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("category", category)
      formData.append("image", image) // only if image exists

      response = await fetch(`${backendUrl}/api/v1/forum`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: formData,
      })
    } else {
      // Use JSON when no image is uploaded
      response = await fetch(`${backendUrl}/api/v1/forum`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          title,
          content,
          category,
        }),
      })
    }

    const data = await response.json()

    if (response.ok) {
      alert("สร้างกระทู้สำเร็จ!")
      setTitle("")
      setContent("")
      setCategory("คำถามกฎหมาย")
      setImage(null)
      setImagePreview(null)

      router.push("/forum")
    } else {
      alert(`เกิดข้อผิดพลาด: ${data.message || "Unknown error"}`)
    }
  }

  const handleClose = () => {
    router.push("/forum")
  }

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mt-8">
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
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="หัวข้อกระทู้ของคุณ..."
              className="w-full text-xl font-medium placeholder-gray-400 border-none outline-none resize-none bg-transparent text-gray-900"
              required
            />
          </div>

          {/* Content Textarea */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนเนื้อหาคำถามของคุณที่นี่..."
              rows={8}
              className="w-full placeholder-gray-400 border-none outline-none resize-none bg-transparent text-gray-700 leading-relaxed"
              required
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <div className="relative w-full h-48 rounded-xl overflow-hidden">
                <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null)
                    setImagePreview(null)
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Tag className="w-5 h-5 text-gray-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-700 font-medium"
              required
            >
              <option value="คำถามกฎหมาย">คำถามกฎหมาย</option>
              <option value="คำปรึกษาทั่วไป">คำปรึกษาทั่วไป</option>
              <option value="ประสบการณ์ผู้ใช้">ประสบการณ์ผู้ใช้</option>
              <option value="ข่าวสารกฎหมาย">ข่าวสารกฎหมาย</option>
              <option value="กิจกรรมและสัมมนา">กิจกรรมและสัมมนา</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4">
            {/* Image Upload Button */}
            <label className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">เพิ่มรูปภาพ</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="flex items-center gap-3">
            
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
            >
              โพสต์
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
