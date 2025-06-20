"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { getSession } from "next-auth/react"
import { Camera } from "lucide-react"

export default function UserProfile() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    thaiId: "",
    lineId: "",
    district: "",
    province: "",
    image: "",
  })

  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Helper function to get the full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/img/default-avatar.jpg"

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath
    }

    // If it starts with a slash, it's a relative path from the domain
    if (imagePath.startsWith("/")) {
      return imagePath
    }

    // If it's just a filename/hash, construct the full URL
    // Adjust this path based on your backend's file serving structure
    return `${backendUrl}/uploads/${imagePath}`
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await getSession()

        console.log("NextAuth Session:", session)

        const token = session?.accessToken
        if (!token) {
          alert("Not authenticated")
          return
        }

        const res = await fetch(`${backendUrl}/api/v1/auth/getMe`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        console.log(data)

        if (data.success) {
          let firstName = ""
          let lastName = ""
          if (data.data.name) {
            const nameParts = data.data.name.trim().split(" ")
            firstName = nameParts.shift() || ""
            lastName = nameParts.join(" ") || ""
          }

          setUser({
            name: data.data.name || "",
            firstName,
            lastName,
            email: data.data.email || "",
            phone: data.data.tel || "",
            thaiId: data.data.thai_id || "",
            lineId: data.data.line_id || "",
            district: data.data.location?.district || "",
            province: data.data.location?.province || "",
            image: data.data.photo || "",
          })
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [backendUrl])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น")
      return
    }

    // Validate file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5MB")
      return
    }

    setUploadingImage(true)

    try {
      const session = await getSession()
      const token = session?.accessToken
      if (!token) {
        alert("Not authenticated")
        return
      }

      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(`${backendUrl}/api/v1/auth/updatePhoto`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()
      console.log("Upload response:", data) // Debug log

      if (data.success) {
        // Update the user state with the new image
        // Try different possible response structures
        const newImagePath = data.data?.photo || data.photo || data.data?.image || data.image

        setUser((prev) => ({
          ...prev,
          image: newImagePath || prev.image,
        }))
        alert("อัปเดตรูปโปรไฟล์สำเร็จ!")
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดตรูปภาพ")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ")
    } finally {
      setUploadingImage(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSave = async () => {
    try {
      const session = await getSession()
      const token = session?.accessToken || localStorage.getItem("token")
      if (!token) {
        alert("Not authenticated")
        return
      }

      const updatedUser = {
        name: `${user.firstName} ${user.lastName}`.trim(),
        tel: user.phone,
        thai_id: user.thaiId,
        line_id: user.lineId,
        location: {
          district: user.district,
          province: user.province,
        },
      }

      const res = await fetch(`${backendUrl}/api/v1/auth/updateprofile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      })

      const data = await res.json()
      if (data.success) {
        alert("Profile updated successfully")
        setIsEditing(false)
      } else {
        alert("Update failed")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred while updating")
    }
  }

  if (loading) return <div className="text-white p-8">Loading...</div>

  // Mask lineID
  const maskLineID = (lineID: string): string => {
    if (!lineID) return ""
    const visible = 0
    const masked = "*".repeat(Math.max(0, lineID.length - visible))
    return masked
  }

  // Mask all but last 4 digits of a phone number
  const maskPhone = (phone: string): string => {
    if (!phone) return ""
    const visible = 4
    const masked = "*".repeat(Math.max(0, phone.length - visible))
    return masked + phone.slice(-visible)
  }

  // Mask email: show first 2 letters of local part, mask rest before @
  const maskEmail = (email: string): string => {
    if (!email) return ""
    const [local, domain] = email.split("@")
    if (!domain) return "*".repeat(email.length) // fallback if not a valid email
    const visible = local.slice(0, 2)
    const masked = "*".repeat(Math.max(0, local.length - 2))
    return `${visible}${masked}@${domain}`
  }

  // Mask all but last 6 digits of Thai ID
  const maskThaiId = (id: string): string => {
    if (!id) return ""
    const visible = 6
    const masked = "*".repeat(Math.max(0, id.length - visible))
    return masked + id.slice(-visible)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-800 px-8 py-6 m-3 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden bg-orange-400 flex-shrink-0 cursor-pointer relative"
                  onClick={handleImageClick}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={getImageUrl(user.image) || "/placeholder.svg"}
                      alt="User avatar"
                      fill
                      className="object-cover transition-opacity group-hover:opacity-75"
                      priority={true}
                      onError={(e) => {
                        console.error("Image load error:", e)
                        // Fallback to default image on error
                        const target = e.target as HTMLImageElement
                        target.src = "/img/default-avatar.jpg"
                      }}
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {/* Camera overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  คลิกเพื่อเปลี่ยนรูปภาพ
                </div>
              </div>
              <h1 className="text-white text-xl font-semibold">{user.name || "อันทพัฒน์"}</h1>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-slate-600 text-white px-6 py-2 rounded-full hover:bg-slate-500 transition-colors font-medium"
            >
              {isEditing ? "ยกเลิก" : "แก้ไขข้อมูล"}
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        {/* Form Section */}
        <div className="bg-gray-50 px-8 py-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                <input
                  type="text"
                  value={user.firstName}
                  onChange={(e) => setUser((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-4 py-3 text-black bg-gray-200 rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                <input
                  type="email"
                  value={isEditing ? user.email : maskEmail(user.email)}
                  onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={isEditing ? user.phone : maskPhone(user.phone)}
                  onChange={(e) => setUser((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ตำบล</label>
                <input
                  type="text"
                  value={user.district}
                  onChange={(e) => setUser((prev) => ({ ...prev, district: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                <input
                  type="text"
                  value={user.lastName}
                  onChange={(e) => setUser((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เลขบัตรประชาชน</label>
                <input
                  type="text"
                  value={isEditing ? user.thaiId : maskThaiId(user.thaiId)}
                  onChange={(e) => setUser((prev) => ({ ...prev, thaiId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors placeholder:text-black"
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ไลน์ไอดี</label>
                <input
                  type="text"
                  value={isEditing ? user.lineId : maskLineID(user.lineId)}
                  onChange={(e) => setUser((prev) => ({ ...prev, lineId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
                <input
                  type="text"
                  value={user.province}
                  onChange={(e) => setUser((prev) => ({ ...prev, province: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-slate-700 text-white px-8 py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
