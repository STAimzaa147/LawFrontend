"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Scale, FileText, AlertCircle, Upload, X, File } from "lucide-react"

type FormData = {
  category_type: "civil" | "criminal" | "unknown"
  description: string
  note: string
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function CreateCasePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [formData, setFormData] = useState<FormData>({
    category_type: "unknown",
    description: "",
    note: "",
  })

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const returnUrl = urlParams.get("returnUrl")
    if (returnUrl) {
      // Store return URL in state or localStorage
      localStorage.setItem("caseCreateReturnUrl", returnUrl)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    // Validate file size (10MB limit per file)
    const maxSize = 10 * 1024 * 1024 // 10MB
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`)
        return false
      }
      return true
    })

    setFiles((prev) => [...prev, ...validFiles])

    // Clear the input so the same file can be selected again if needed
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
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

    // Validation
    if (!formData.description.trim()) {
      setError("Description is required")
      return
    }

    if (!formData.category_type) {
      setError("Category type is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create FormData for multipart/form-data submission
      const submitFormData = new FormData()

      // Add form fields
      submitFormData.append("category_type", formData.category_type)
      submitFormData.append("description", formData.description)
      submitFormData.append("note", formData.note)
      submitFormData.append("client_id", session?.user?.id || "")

      // Add files
      files.forEach((file) => {
        submitFormData.append("file", file)
      })

      const res = await fetch(`${backendUrl}/api/v1/caseRequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          // Don't set Content-Type header - let the browser set it with boundary
        },
        body: submitFormData,
      })

      const data = await res.json()

      if (data.success) {
        const returnUrl = localStorage.getItem("caseCreateReturnUrl")
        if (returnUrl) {
          localStorage.removeItem("caseCreateReturnUrl")
          // Add a parameter to indicate case was created
          const separator = returnUrl.includes("?") ? "&" : "?"
          router.push(`${returnUrl}${separator}caseCreated=true`)
        } else {
          router.push("/case")
        }
      } else {
        setError(data.message || "Failed to create case")
      }
    } catch (error) {
      console.error("Error creating case:", error)
      setError("An error occurred while creating the case")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center">
      <div className="text-center">
        <Scale className="w-16 h-16 text-white mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">ปฏิเสธการเข้าถึง</h1>
        <p className="text-gray-300 mb-4">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถสร้างคดีได้</p>
        <button
          onClick={() => router.push("/api/auth/signin")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
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
            <Scale className="w-8 h-8 text-[#C9A55C]" />
            <h1 className="text-2xl font-bold text-white">สร้างคดีใหม่</h1>
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
          {/* Category Type */}
          <div>
            <label htmlFor="category_type" className="block text-sm text-black font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              ประเภทของคดี *
            </label>
            <select
              id="category_type"
              name="category_type"
              value={formData.category_type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="unknown">ไม่ทราบ</option>
              <option value="civil">คดีแพ่ง</option>
              <option value="criminal">คดีอาญา</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              รายละเอียดของคดี *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="โปรดใส่รายละเอียดของคดีของคุณอย่างชัดเจน..."
              className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.description.length} ตัวอักษร</p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-2" />
              เอกสารแนบ (ไม่จำเป็น)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">คลิกเพื่ออัปโหลดไฟล์ หรือ ลากไฟล์มาวางที่นี่</span>
                <span className="text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG, GIF (สูงสุด 10MB ต่อไฟล์)</span>
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">ไฟล์ที่เลือก:</h4>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุเพิ่มเติม (ไม่จำเป็น)
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows={4}
              placeholder="หมายเหตุเพิ่มเติมหรือความต้องการพิเศษใด ๆ..."
              className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#C9A55C] text-white rounded-lg hover:bg-[#C9A55C]/80 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  กำลังสร้าง...
                </>
              ) : (
                "สร้างคดี"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">คำแนะนำในการสร้างคดี:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• ระบุรายละเอียดของปัญหากฎหมายอย่างชัดเจน</li>
          <li>• เลือกประเภทของคดีให้ตรงกับปัญหา</li>
          <li>• แนบเอกสารประกอบที่เกี่ยวข้อง</li>
          <li>• เพิ่มหมายเหตุหรือคำขอพิเศษในส่วนของหมายเหตุ</li>
        </ul>
      </div>
    </main>
  </div>
)

}
