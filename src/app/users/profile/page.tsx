"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { getSession } from "next-auth/react"
import Image from "next/image"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface User {
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  thaiId: string
  lineId: string
  district: string
  province: string
  image: string
  role?: string
  provider?: string
  createdAt?: string
}

interface LawyerProfile {
  slogan: string
  summary: string
  lawfirm_name: string
  consultationRate: {
    min: number
    max: number
  }
  documentDeliveryRate: {
    min: number
    max: number
  }
  civilCase_specialized: string[]
  criminalCase_specialized: string[]
  has_law_license: boolean
  is_verified_by_council: boolean
  verificationDocs: string[]
}

const civilCaseOptions = [
  "คดีแพ่ง",
  "คดีแรงงาน",
  "คดีที่เกี่ยวกับที่อยู่อาศัย",
  "คดีละเมิด / หมิ่นประมาท",
  "คดีครอบครัวและการรับอุปการะ",
  "คดีธุรกิจและการขอสิทธิบัตร",
  "คดีซื้อขายอสังหาริมทรัพย์",
  "คดีออนไลน์",
  "คดีที่ดินและสิทธิบรรพบุรุษ",
  "คดีที่ดินและทรัพย์สิน",
]

const criminalCaseOptions = ["คดีอาญา", "คดีต่างด้าว / ตรวจคนเข้าเมือง"]

export default function ProfilePage() {
  const [user, setUser] = useState<User>({
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
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile>({
    slogan: "",
    summary: "",
    lawfirm_name: "",
    consultationRate: { min: 0, max: 0 },
    documentDeliveryRate: { min: 0, max: 0 },
    civilCase_specialized: [],
    criminalCase_specialized: [],
    has_law_license: false,
    is_verified_by_council: false,
    verificationDocs: [],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<User>(user)
  const [lawyerFormData, setLawyerFormData] = useState<LawyerProfile>(lawyerProfile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const maskValue = (value: string, type: "email" | "phone" | "thaiId" | "lineId") => {
  if (!value) return "";

  switch (type) {
    case "email": {
      const [user, domain] = value.split("@");
      return user.length > 2 ? `${user.slice(0, 2)}***@${domain}` : `***@${domain}`;
    }
    case "phone": {
      return value.length > 4 ? `*******${value.slice(-3)}` : "**********";
    }
    case "thaiId": {
      return value.length === 17 ? `***********${value.slice(11, 17)}` : "*************";
    }
    case "lineId": {
      return value.length > 3 ? `${value.slice(0, 2)}***${value.slice(-1)}` : "***";
    }
    default:
      return "***";
  }
};

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await getSession()
        console.log("NextAuth Session:", session)
        const token = session?.accessToken
        if (!token) {
          setError("ไม่ได้รับการยืนยันตัวตน")
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
          const userData = {
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
            role: data.data.role || "user",
            provider: data.data.provider || "credentials",
            createdAt: data.data.createdAt || "",
          }
          setUser(userData)
          setFormData(userData)
          // If user is a lawyer, fetch lawyer profile
          if (userData.role === "lawyer") {
            await fetchLawyerProfile(token)
          }
        } else {
          setError("ไม่สามารถดึงข้อมูลผู้ใช้ได้")
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setError("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้")
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const fetchLawyerProfile = async (token: string) => {
    try {
      const session = await getSession()
      const res = await fetch(`${backendUrl}/api/v1/lawyer/${session?.user.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (data.success && data.data) {
        const lawyerData = {
          slogan: data.data.slogan || "",
          summary: data.data.summary || "",
          lawfirm_name: data.data.lawfirm_name || "",
          consultationRate: {
            min: data.data.consultationRate?.min || 0,
            max: data.data.consultationRate?.max || 0,
          },
          documentDeliveryRate: {
            min: data.data.documentDeliveryRate?.min || 0,
            max: data.data.documentDeliveryRate?.max || 0,
          },
          civilCase_specialized: data.data.civilCase_specialized || [],
          criminalCase_specialized: data.data.criminalCase_specialized || [],
          has_law_license: data.data.has_law_license || false,
          is_verified_by_council: data.data.is_verified_by_council || false,
          verificationDocs: data.data.verificationDocs || [],
        }
        setLawyerProfile(lawyerData)
        setLawyerFormData(lawyerData)
        console.log("Lawyer Data : ",lawyerData)
      }
    } catch (error) {
      console.error("Error fetching lawyer profile:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Update name when firstName or lastName changes
    if (field === "firstName" || field === "lastName") {
      const firstName = field === "firstName" ? value : formData.firstName
      const lastName = field === "lastName" ? value : formData.lastName
      setFormData((prev) => ({
        ...prev,
        name: `${firstName} ${lastName}`.trim(),
      }))
    }
  }

  const handleLawyerInputChange = <K extends keyof LawyerProfile>(
  field: K,
  value: LawyerProfile[K]
) => {
  setLawyerFormData((prev) => ({
    ...prev,
    [field]: value,
  }))
}

  const handleRateChange = (
    rateType: "consultationRate" | "documentDeliveryRate",
    minMax: "min" | "max",
    value: string,
  ) => {
    const numValue = Number.parseFloat(value) || 0
    setLawyerFormData((prev) => ({
      ...prev,
      [rateType]: {
        ...prev[rateType],
        [minMax]: numValue,
      },
    }))
  }

  const handleSpecializationChange = (
    type: "civilCase_specialized" | "criminalCase_specialized",
    value: string,
    checked: boolean,
  ) => {
    setLawyerFormData((prev) => ({
      ...prev,
      [type]: checked ? [...prev[type], value] : prev[type].filter((item) => item !== value),
    }))
  }

  const handleSave = async () => {
    try {
      const session = await getSession()
      const token = session?.accessToken
      if (!token) {
        setError("ไม่ได้รับการยืนยันตัวตน")
        return
      }
      // Save user profile
      const updateData = {
        name: formData.name,
        tel: formData.phone,
        thai_id: formData.thaiId,
        line_id: formData.lineId,
        photo: formData.image,
        location: {
          district: formData.district,
          province: formData.province,
        },
      }
      const userRes = await fetch(`${backendUrl}/api/v1/auth/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })
      const userData = await userRes.json()
      if (!userData.success) {
        setError("ไม่สามารถอัปเดตโปรไฟล์ได้")
        return
      }
      // Save lawyer profile if user is a lawyer
      if (user.role === "lawyer") {
        const lawyerRes = await fetch(`${backendUrl}/api/v1/lawyer/${session.user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(lawyerFormData),
        })
        const lawyerData = await lawyerRes.json()
        if (!lawyerData.success) {
          setError("ไม่สามารถอัปเดตโปรไฟล์ทนายความได้")
          return
        }
        setLawyerProfile(lawyerFormData)
      }
      setUser(formData)
      setIsEditing(false)
      setError(null)
      alert("อัปเดตโปรไฟล์สำเร็จ!")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์")
    }
  }

  const handleCancel = () => {
    setFormData(user)
    setLawyerFormData(lawyerProfile)
    setIsEditing(false)
    setError(null)
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง")
      return
    }
    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดรูปภาพต้องไม่เกิน 5MB")
      return
    }
    setIsUploadingPhoto(true)
    setError(null)
    try {
      const session = await getSession()
      const token = session?.accessToken
      if (!token) {
        setError("ไม่ได้รับการยืนยันตัวตน")
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
      if (data.success) {
        // Update the user state with new photo URL
        const updatedUser = { ...user, image: data.data.photo || data.data.image || URL.createObjectURL(file) }
        setUser(updatedUser)
        setFormData(updatedUser)
        alert("อัปเดตรูปภาพสำเร็จ!")
      } else {
        setError("ไม่สามารถอัปเดตรูปภาพได้")
      }
    } catch (error) {
      console.error("Error updating photo:", error)
      setError("เกิดข้อผิดพลาดในการอัปเดตรูปภาพ")
    } finally {
      setIsUploadingPhoto(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handlePhotoClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "lawyer":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "ผู้ดูแลระบบ"
      case "lawyer":
        return "ทนายความ"
      default:
        return "ผู้ใช้"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800">ข้อผิดพลาด</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">โปรไฟล์</h1>
          <p className="text-gray-400 mt-1">จัดการการตั้งค่าบัญชีและข้อมูลส่วนตัวของคุณ</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                บันทึกการเปลี่ยนแปลง
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              แก้ไขโปรไฟล์
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  className={`w-24 h-24 relative rounded-full bg-gray-200 overflow-hidden ${isEditing ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                  onClick={handlePhotoClick}
                >
                  {isUploadingPhoto ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : formData.image ? (
                    <Image
                      src={formData.image || "/placeholder.svg"}
                      alt={formData.name}
                      fill
                      className="object-cover rounded-full" 
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-semibold">
                      {formData.firstName && formData.lastName
                        ? `${formData.firstName[0]}${formData.lastName[0]}`
                        : formData.name
                        ? formData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "U"}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <>
                    <button
                      onClick={handlePhotoClick}
                      disabled={isUploadingPhoto}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </>
                )}
                {isEditing}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">{user.name || "ไม่มีชื่อ"}</h2>
                  {user.role && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}
                    >
                      {getRoleText(user.role)}
                    </span>
                  )}
                  {user.role === "lawyer" && lawyerProfile.is_verified_by_council && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">
                      ยืนยันแล้ว
                    </span>
                  )}
                </div>
                <p className="text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {user.email || "ไม่มีอีเมล"}
                </p>
                {user.role === "lawyer" && lawyerProfile.lawfirm_name && (
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2-5V9a1 1 0 011-1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1a1 1 0 01-1-1z"
                      />
                    </svg>
                    {lawyerProfile.lawfirm_name}
                  </p>
                )}
                {user.createdAt && (
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V9"
                      />
                    </svg>
                    สมาชิกตั้งแต่ {new Date(user.createdAt).toLocaleDateString("th-TH")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              ข้อมูลพื้นฐาน
            </h3>
            <p className="text-gray-600 text-sm mt-1">ข้อมูลส่วนตัวและรายละเอียดการติดต่อของคุณ</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  ชื่อ
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  placeholder="กรอกชื่อของคุณ"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:text-gray-500 disabled:bg-gray-50 "
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  นามสกุล
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  placeholder="กรอกนามสกุลของคุณ"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                ที่อยู่อีเมล
              </label>
              <input
                id="email"
                type="email"
                value={isEditing ? formData.email : maskValue(formData.email, "email")}
                disabled={true}
                placeholder="กรอกอีเมลของคุณ"
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <p className="text-xs text-gray-500">ไม่สามารถเปลี่ยนอีเมลได้</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  หมายเลขโทรศัพท์
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={isEditing ? formData.phone : maskValue(formData.phone, "phone")}
                  disabled={true}
                  placeholder="123-456-7890"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
                <p className="text-xs text-gray-500">ไม่สามารถเปลี่ยนหมายเลขโทรศัพท์ได้</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="lineId" className="block text-sm font-medium text-gray-700">
                  LINE ID
                </label>
                <input
                  id="lineId"
                  type="text"
                  value={isEditing ? formData.lineId : maskValue(formData.lineId, "lineId")}
                  onChange={(e) => handleInputChange("lineId", e.target.value)}
                  disabled={!isEditing}
                  placeholder=""
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lawyer Professional Information - Only show if user is a lawyer */}
        {user.role === "lawyer" && (
          <>
            {/* Professional Details */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2-5V9a1 1 0 011-1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1a1 1 0 01-1-1z"
                    />
                  </svg>
                  ข้อมูลทางวิชาชีพ
                </h3>
                <p className="text-gray-600 text-sm mt-1">รายละเอียดการประกอบวิชาชีพกฎหมายและข้อมูลรับรอง</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="lawfirm_name" className="block text-sm font-medium text-gray-700">
                    ชื่อสำนักงานกฎหมาย
                  </label>
                  <input
                    id="lawfirm_name"
                    type="text"
                    value={lawyerFormData.lawfirm_name}
                    onChange={(e) => handleLawyerInputChange("lawfirm_name", e.target.value)}
                    disabled={!isEditing}
                    placeholder="กรอกชื่อสำนักงานกฎหมายของคุณ"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="slogan" className="block text-sm font-medium text-gray-700">
                    สโลแกนทางวิชาชีพ
                  </label>
                  <input
                    id="slogan"
                    type="text"
                    value={lawyerFormData.slogan}
                    onChange={(e) => handleLawyerInputChange("slogan", e.target.value)}
                    disabled={!isEditing}
                    placeholder="กรอกสโลแกนทางวิชาชีพของคุณ"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                    สรุปประวัติทางวิชาชีพ
                  </label>
                  <textarea
                    id="summary"
                    rows={4}
                    value={lawyerFormData.summary}
                    onChange={(e) => handleLawyerInputChange("summary", e.target.value)}
                    disabled={!isEditing}
                    placeholder="อธิบายประสบการณ์และความเชี่ยวชาญของคุณ"
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">อัตราค่าปรึกษา (บาท)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="ต่ำสุด"
                        value={lawyerFormData.consultationRate.min || ""}
                        onChange={(e) => handleRateChange("consultationRate", "min", e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      <input
                        type="number"
                        placeholder="สูงสุด"
                        value={lawyerFormData.consultationRate.max || ""}
                        onChange={(e) => handleRateChange("consultationRate", "max", e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">อัตราค่าจัดทำเอกสาร (บาท)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="ต่ำสุด"
                        value={lawyerFormData.documentDeliveryRate.min || ""}
                        onChange={(e) => handleRateChange("documentDeliveryRate", "min", e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                      <input
                        type="number"
                        placeholder="สูงสุด"
                        value={lawyerFormData.documentDeliveryRate.max || ""}
                        onChange={(e) => handleRateChange("documentDeliveryRate", "max", e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      id="has_law_license"
                      type="checkbox"
                      checked={lawyerFormData.has_law_license}
                      onChange={(e) => handleLawyerInputChange("has_law_license", e.target.checked)}
                      disabled={true}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="has_law_license" className="text-sm font-medium text-gray-700">
                      มีใบอนุญาตประกอบวิชาชีพกฎหมาย 
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      id="is_verified_by_council"
                      type="checkbox"
                      checked={lawyerFormData.is_verified_by_council}
                      onChange={(e) => handleLawyerInputChange("is_verified_by_council", e.target.checked)}
                      disabled={true}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label htmlFor="is_verified_by_council" className="text-sm font-medium text-gray-700">
                      ยืนยันโดยสภาทนายความ (เฉพาะผู้ดูแลระบบ)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  ความเชี่ยวชาญทางกฎหมาย
                </h3>
                <p className="text-gray-600 text-sm mt-1">เลือกสาขาความเชี่ยวชาญทางกฎหมายของคุณ</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">คดีแพ่ง</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {civilCaseOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          id={`civil-${option}`}
                          type="checkbox"
                          checked={lawyerFormData.civilCase_specialized.includes(option)}
                          onChange={(e) =>
                            handleSpecializationChange("civilCase_specialized", option, e.target.checked)
                          }
                          disabled={!isEditing}
                          className="h-4 w-4  focus:ring-blue-500 border-gray-300 text-gray-700 rounded disabled:opacity-50"
                        />
                        <label htmlFor={`civil-${option}`} className="text-sm text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">คดีอาญา</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {criminalCaseOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          id={`criminal-${option}`}
                          type="checkbox"
                          checked={lawyerFormData.criminalCase_specialized.includes(option)}
                          onChange={(e) =>
                            handleSpecializationChange("criminalCase_specialized", option, e.target.checked)
                          }
                          disabled={!isEditing}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 text-gray-700 rounded disabled:opacity-50"
                        />
                        <label htmlFor={`criminal-${option}`} className="text-sm text-gray-700">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              ข้อมูลส่วนตัว
            </h3>
            <p className="text-gray-600 text-sm mt-1">รายละเอียดส่วนตัวเพิ่มเติมและเอกสารประจำตัว</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="thaiId" className="block text-sm font-medium text-gray-700">
                หมายเลขบัตรประจำตัวประชาชน
              </label>
              <input
                id="thaiId"
                type="text"
                value={isEditing ? formData.thaiId : maskValue(formData.thaiId, "thaiId")}
                onChange={(e) => handleInputChange("thaiId", e.target.value)}
                disabled={!isEditing}
                placeholder=""
                maxLength={13}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              ที่อยู่
            </h3>
            <p className="text-gray-600 text-sm mt-1">ข้อมูลที่อยู่ของคุณ</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                  เขต/อำเภอ
                </label>
                <input
                  id="district"
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  disabled={!isEditing}
                  placeholder="กรอกเขต/อำเภอ"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  จังหวัด
                </label>
                <input
                  id="province"
                  type="text"
                  value={formData.province}
                  onChange={(e) => handleInputChange("province", e.target.value)}
                  disabled={!isEditing}
                  placeholder="กรอกจังหวัด"
                  className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
