// Modified Edit News Page using formData pattern
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { X, Camera, Tag } from 'lucide-react'
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface NewsItem {
  _id: string
  title: string
  content: string
  category: string
  image?: string
  poster_id: {
    _id: string
    name: string
  }
}

type FormDataType = {
  title: string
  content: string
  category: string
}

const newsCategories = [
  { value: "", label: "เลือกหมวดหมู่" },
  { value: "ข่าวกฎหมายใหม่", label: "ข่าวกฎหมายใหม่" },
  { value: "การตีความกฎหมาย", label: "การตีความกฎหมาย" },
  { value: "คดีความสำคัญ", label: "คดีความสำคัญ" },
  { value: "กฎหมายแรงงาน", label: "กฎหมายแรงงาน" },
  { value: "กฎหมายธุรกิจ", label: "กฎหมายธุรกิจ" },
  { value: "กฎหมายครอบครัว", label: "กฎหมายครอบครัว" },
  { value: "กฎหมายอาญา", label: "กฎหมายอาญา" },
  { value: "ข่าวกิจกรรมทางกฎหมาย", label: "ข่าวกิจกรรมทางกฎหมาย" },
  { value: "บทวิเคราะห์ทางกฎหมาย", label: "บทวิเคราะห์ทางกฎหมาย" },
]

export default function EditNewsPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormDataType>({ title: "", content: "", category: "" })
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null) // Keep this to store the fetched item

  useEffect(() => {
    const fetchNews = async () => {
      if (!session?.accessToken || !id) {
        setLoading(false)
        return
      }
      try {
        // FIX: Changed from apiFetch to native fetch for GET request
        const response = await fetch(`${backendUrl}/api/v1/news/${id}`, {
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

        const data = await response.json()

        if (data.success) {
          const item: NewsItem = data.data
          setNewsItem(item) // Store the fetched item
          setFormData({ title: item.title, content: item.content, category: item.category })
          setCurrentImage(item.image)
        } else {
          toast({ title: "ไม่พบข้อมูล", description: data.message, variant: "destructive" })
          router.push("/admin/news")
        }
      } catch (err: any) {
        toast({ title: "ข้อผิดพลาด", description: err.message || "ไม่สามารถโหลดข้อมูลได้", variant: "destructive" })
        router.push("/admin/news")
      } finally {
        setLoading(false)
      }
    }
    fetchNews()
  }, [id, session?.accessToken, toast, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast({ title: "ไฟล์ใหญ่เกินไป", description: "ขนาดไม่ควรเกิน 10MB", variant: "destructive" })
        return
      }
      setNewImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.accessToken || !newsItem) return // Ensure newsItem is loaded
    if (!formData.title.trim()) {
      return toast({ title: "กรุณาใส่หัวข้อ", variant: "destructive" })
    }
    if (!formData.content.trim()) {
      return toast({ title: "กรุณาใส่เนื้อหา", variant: "destructive" })
    }
    if (!formData.category) {
      return toast({ title: "กรุณาเลือกหมวดหมู่", variant: "destructive" })
    }
    setSaving(true)
    try {
      const form = new FormData()
      form.append("title", formData.title)
      form.append("content", formData.content)
      form.append("category", formData.category)
      if (newImage) {
        form.append("image", newImage)
      } else if (currentImage === undefined) {
        // If user explicitly removed the image, send an empty string to clear it on backend
        form.append("image", "")
      }

      // FIX: Changed from apiFetch to native fetch for PUT request
      const response = await fetch(`${backendUrl}/api/v1/news/${id}`, {
        method: "PUT",
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

      const data = await response.json()

      if (data.success) {
        toast({ title: "บันทึกสำเร็จ", description: "ข่าวถูกอัปเดตเรียบร้อยแล้ว" })
        router.push("/admin/news")
      } else {
        toast({ title: "ไม่สำเร็จ", description: data.message || "ไม่สามารถอัปเดตข่าวได้", variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: err.message || "ไม่สามารถอัปเดตได้", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center text-white text-xl">กำลังโหลด...</div>
  }

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden mt-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">{session?.user?.name?.charAt(0) || "U"}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{session?.user?.name}</h2>
          </div>
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="หัวข้อข่าวของคุณ..."
            className="w-full text-xl font-medium placeholder-gray-400 border-none outline-none bg-transparent text-gray-900"
            required
          />
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            placeholder="เขียนเนื้อหาข่าวของคุณที่นี่..."
            className="w-full placeholder-gray-400 border-none outline-none bg-transparent text-gray-700"
            required
          />
          {(newImagePreview || currentImage) && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden">
              <Image src={newImagePreview || currentImage!} alt="Preview" fill unoptimized className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  newImagePreview ? setNewImagePreview(null) : setCurrentImage(undefined)
                  setNewImage(null)
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
              {newsCategories.map((cat) => (
                <option key={cat.value} value={cat.value} disabled={cat.value === ""}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </form>
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <label className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">เปลี่ยนรูปภาพ</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 font-medium"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </div>
    </div>
  )
}