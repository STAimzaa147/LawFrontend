"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Image from "next/image"
import {
  ArrowLeft,
  Scale,
  FileText,
  AlertCircle,
  Upload,
  X,
  File,
  Star,
  MapPin,
  Phone,
  Award,
  Clock,
  Send,
  Building,
  CheckSquare,
} from "lucide-react"

type FormData = {
  category_type: "civil" | "criminal" | "unknown"
  description: string
  note: string
}

interface Location {
  district: string
  province: string
}

interface LawyerUser {
  _id: string
  name: string
  tel: string
  location: Location
  photo?: string
}

interface Lawyer {
  _id: LawyerUser
  lawfirm_name: string
  slogan: string
  summary: string
  civilCase_specialized: string[]
  criminalCase_specialized: string[]
  consultationRate: {
    min: number
    max: number
  }
  documentDeliveryRate?: {
    min?: number
    max?: number
  }
  has_law_license: boolean
  is_verified_by_council: boolean
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

  // Lawyer selection states
  const [selectedLawyers, setSelectedLawyers] = useState<string[]>([])
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)

  // Consultation modal states
  const [dateSelectionMode, setDateSelectionMode] = useState<"exact" | "range">("exact")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [consultationDetails, setConsultationDetails] = useState("")
  const [consultationLoading, setConsultationLoading] = useState(false)

  // Add these state variables after the existing ones
  const [recommendedLawyers, setRecommendedLawyers] = useState<Lawyer[]>([])
  const [lawyersLoading, setLawyersLoading] = useState(true)
  const [lawyersError, setLawyersError] = useState("")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const returnUrl = urlParams.get("returnUrl")
    if (returnUrl) {
      localStorage.setItem("caseCreateReturnUrl", returnUrl)
    }
  }, [])

  useEffect(() => {
    const fetchRecommendedLawyers = async () => {
      try {
        setLawyersLoading(true)
        setLawyersError("")
        const res = await fetch(`${backendUrl}/api/v1/lawyer`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        })
        const data = await res.json()
        if (data.success) {
          setRecommendedLawyers(data.data || data)
        } else {
          setLawyersError(data.message || "Failed to fetch recommended lawyers")
        }
      } catch (error) {
        console.error("Error fetching recommended lawyers:", error)
        setLawyersError("An error occurred while fetching recommended lawyers")
      } finally {
        setLawyersLoading(false)
      }
    }

    if (session?.accessToken) {
      fetchRecommendedLawyers()
    }
  }, [session?.accessToken])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selectedFile = e.target.files?.[0];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (selectedFile) {
    if (selectedFile.size > maxSize) {
      setError(`File "${selectedFile.name}" is too large. Maximum size is 10MB.`);
    } else {
      setFiles([selectedFile]); // 👈 Only one file
    }
  }
  e.target.value = "";
};

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

  // Extract case creation logic into a separate function
  const createCase = async () => {
    console.log("Case Without Lawyer Created")
    setLoading(true)
    setError("")
    try {
      const submitFormData = new FormData()
      submitFormData.append("category_type", formData.category_type)
      submitFormData.append("description", formData.description)
      submitFormData.append("note", formData.note)
      submitFormData.append("client_id", session?.user?.id || "")

      files.forEach((file) => {
        submitFormData.append("file", file)
      })

      const res = await fetch(`${backendUrl}/api/v1/caseRequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: submitFormData,
      })

      const data = await res.json()
      if (data.success) {
        const returnUrl = localStorage.getItem("caseCreateReturnUrl")
        if (returnUrl) {
          localStorage.removeItem("caseCreateReturnUrl")
          const separator = returnUrl.includes("?") ? "&" : "?"
          router.push(`${returnUrl}${separator}caseCreated=true`)
        } else {
          router.push("/case")
        }
        return true
      } else {
        setError(data.message || "Failed to create case")
        return false
      }
    } catch (error) {
      console.error("Error creating case:", error)
      setError("An error occurred while creating the case")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description.trim()) {
      setError("Description is required")
      return
    }
    if (!formData.category_type) {
      setError("Category type is required")
      return
    }

    if (selectedLawyers.length > 0) {
      // Just open modal, don't create anything yet
      setIsConsultationModalOpen(true)
    } else {
      // No lawyers: create case directly
      createCase()
    }
  }

  const getFilteredLawyers = () => {
    if (formData.category_type === "unknown") {
      return recommendedLawyers.slice(0, 3)
    }
    const filtered = recommendedLawyers.filter((lawyer) => {
      if (formData.category_type === "civil") {
        return lawyer.civilCase_specialized.length > 0
      } else if (formData.category_type === "criminal") {
        return lawyer.criminalCase_specialized.length > 0
      }
      return true
    })
    return filtered.slice(0, 3)
  }

  const handleLawyerSelection = (lawyerId: string) => {
    setSelectedLawyers((prev) => {
      if (prev.includes(lawyerId)) {
        return prev.filter((id) => id !== lawyerId)
      } else {
        return [...prev, lawyerId]
      }
    })
  }

  const handleSelectAllLawyers = () => {
    const filteredLawyers = getFilteredLawyers()
    const allLawyerIds = filteredLawyers.map((lawyer) => lawyer._id._id)
    if (selectedLawyers.length === allLawyerIds.length) {
      // If all are selected, deselect all
      setSelectedLawyers([])
    } else {
      // Select all visible lawyers
      setSelectedLawyers(allLawyerIds)
    }
  }

  const handleLawyerCardClick = (lawyer: Lawyer, e: React.MouseEvent) => {
    // Prevent opening profile if clicking on checkbox or label
    if (
      (e.target as HTMLElement).closest('input[type="checkbox"]') ||
      (e.target as HTMLElement).closest('label[for*="lawyer-"]')
    ) {
      return
    }
    console.log("new tab : ", lawyer)
    // Open a new tab to the lawyer's profile
    window.open(`/lawyers/${lawyer._id._id}`, "_blank") // Adjust the URL path if needed
  }

  const handleConsultationSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setConsultationLoading(true);
  setError("");
  console.log("Case With Lawyer Created");

  try {
    const form = new FormData();

    // Append text fields
    form.append("category_type", formData.category_type);
    form.append("description", formData.description);
    form.append("note", formData.note);
    form.append("dateMode", dateSelectionMode);
    form.append("clientId", session?.user?.id || "");

    if (dateSelectionMode === "exact" && selectedDate) {
      form.append("selectedDate", selectedDate.toISOString());
    }

    if (dateSelectionMode === "range" && startDate && endDate) {
      form.append("startDate", startDate.toISOString());
      form.append("endDate", endDate.toISOString());
    }

    if (selectedTime) {
      form.append("selectedTime", selectedTime.toISOString());
    }

    form.append("details", consultationDetails);

    // Append offered lawyers (array)
    selectedLawyers.forEach((lawyerId, index) => {
      form.append(`offered_Lawyers[${index}]`, lawyerId);
    });

    // Append the summons file
    if (files.length > 0) {
      form.append("file", files[0]); // ⬅️ this must match backend's upload.single("file")
    }

    const res = await fetch(`${backendUrl}/api/v1/caseRequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        // ⛔ DO NOT set Content-Type manually (browser will set boundary automatically)
      },
      body: form,
    });

    const result = await res.json();

    if (result.success) {
      setIsConsultationModalOpen(false);
      setSelectedLawyers([]);
      setConsultationDetails("");
      setSelectedDate(null);
      setStartDate(null);
      setEndDate(null);
      setSelectedTime(null);

      alert("ส่งคำขอปรึกษาเรียบร้อยแล้ว ทนายความจะติดต่อกลับภายใน 24 ชั่วโมง");

      const returnUrl = localStorage.getItem("caseCreateReturnUrl");
      if (returnUrl) {
        localStorage.removeItem("caseCreateReturnUrl");
        const separator = returnUrl.includes("?") ? "&" : "?";
        router.push(`${returnUrl}${separator}caseCreated=true`);
      } else {
        router.push("/case");
      }
    } else {
      console.error("Consultation request failed:", result);
      setError("ไม่สามารถส่งคำขอปรึกษาได้ กรุณาลองใหม่อีกครั้ง");
    }
  } catch (error) {
    console.error("Error sending consultation request:", error);
    setError("เกิดข้อผิดพลาดในการส่งคำขอปรึกษา");
  } finally {
    setConsultationLoading(false);
  }
};

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Helper function to get all specializations for a lawyer
  const getAllSpecializations = (lawyer: Lawyer) => {
    return [...lawyer.civilCase_specialized, ...lawyer.criminalCase_specialized]
  }

  // Helper function to format location
  const formatLocation = (location: Location) => {
    return `${location.district}, ${location.province}`
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

            {/* หมายเรียก Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-2" />
                แนบหมายเรียก (ถ้ามี)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple={false}
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
          </form>
        </div>

        {/* Recommended Lawyers Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-[#C9A55C]" />
              <h2 className="text-xl font-bold text-gray-900">ทนายความที่แนะนำ</h2>
            </div>
            <div className="flex items-center gap-4">
              {getFilteredLawyers().length > 0 && (
                <button
                  onClick={handleSelectAllLawyers}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <CheckSquare className="w-4 h-4" />
                  {selectedLawyers.length === getFilteredLawyers().length ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
                </button>
              )}
              {selectedLawyers.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">เลือกแล้ว {selectedLawyers.length} คน</span>
                </div>
              )}
            </div>
          </div>

          {lawyersLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#C9A55C]"></div>
              <span className="ml-3 text-gray-600">กำลังโหลดทนายความที่แนะนำ...</span>
            </div>
          ) : lawyersError ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500 opacity-50" />
              <p className="text-red-600 mb-4">{lawyersError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {getFilteredLawyers().map((lawyer) => (
                <div
                  key={lawyer._id._id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={(e) => handleLawyerCardClick(lawyer, e)}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Lawyer Image */}
                    <div className="flex-shrink-0">
                      <Image
                        src={lawyer._id.photo || "/img/default-avatar.jpg"}
                        alt={lawyer._id.name}
                        width={80}
                        height={80}
                        unoptimized
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>

                    {/* Lawyer Info */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-[#C9A55C] transition-colors">
                            {lawyer._id.name}
                          </h3>

                          {/* Law Firm */}
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{lawyer.lawfirm_name}</span>
                          </div>

                          {/* Slogan */}
                          {lawyer.slogan && (
                            <p className="text-sm text-gray-600 italic mb-2">&quot;{lawyer.slogan}&quot;</p>
                          )}

                          {/* Summary */}
                          <p className="text-sm text-gray-600 mb-3">{lawyer.summary}</p>

                          {/* Specializations */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {getAllSpecializations(lawyer).map((spec, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {spec}
                              </span>
                            ))}
                          </div>

                          {/* Consultation Rate */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                ค่าปรึกษา: {lawyer.consultationRate.min.toLocaleString()}-
                                {lawyer.consultationRate.max.toLocaleString()} บาท
                              </span>
                            </div>
                          </div>

                          {/* Verification badges */}
                          <div className="flex gap-2 mb-3">
                            {lawyer.has_law_license && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                มีใบอนุญาต
                              </span>
                            )}
                            {lawyer.is_verified_by_council && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                ยืนยันโดยสภา
                              </span>
                            )}
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{formatLocation(lawyer._id.location)}</span>
                          </div>
                        </div>

                        {/* Contact Info and Checkbox */}
                        <div className="flex flex-col gap-3 md:items-end">
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{lawyer._id.tel}</span>
                            </div>
                          </div>

                          {/* Centered Checkbox */}
                          <div className="flex justify-center md:justify-end">
                            <input
                              type="checkbox"
                              id={`lawyer-${lawyer._id._id}`}
                              checked={selectedLawyers.includes(lawyer._id._id)}
                              onChange={() => handleLawyerSelection(lawyer._id._id)}
                              className="w-5 h-5 text-[#C9A55C] border-gray-300 rounded focus:ring-[#C9A55C] focus:ring-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!lawyersLoading && !lawyersError && getFilteredLawyers().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>ไม่พบทนายความที่แนะนำสำหรับประเภทคดีนี้</p>
            </div>
          )}
        </div>

        {/* Form Actions - Moved to bottom before tips */}
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
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#C9A55C] text-white rounded-lg hover:bg-[#C9A55C]/80 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                  กำลังสร้าง...
                </>
              ) : selectedLawyers.length > 0 ? (
                "ส่งคำขอปรึกษาและสร้างคดี"
              ) : (
                "สร้างคดี"
              )}
            </button>
          </div>
        </div>

        {/* Consultation Request Modal */}
        {isConsultationModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            style={{ marginTop: 0 }}
          >
            <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setIsConsultationModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl text-black font-bold mb-4 text-center">ส่งคำขอปรึกษา</h2>

              {/* Selected Lawyers */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">ทนายความที่เลือก:</h3>
                <div className="space-y-1">
                  {selectedLawyers.map((lawyerId) => {
                    const lawyer = recommendedLawyers.find((l) => l._id._id === lawyerId)
                    return (
                      <div key={lawyerId} className="text-sm text-gray-600">
                        • {lawyer?._id.name}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Case Info */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">ข้อมูลคดี:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <strong>ประเภท:</strong>{" "}
                    {formData.category_type === "civil"
                      ? "คดีแพ่ง"
                      : formData.category_type === "criminal"
                        ? "คดีอาญา"
                        : "ไม่ทราบ"}
                  </div>
                  <div>
                    <strong>รายละเอียด:</strong> {formData.description.slice(0, 100)}...
                  </div>
                </div>
              </div>

              {/* Consultation Form */}
              <form className="space-y-4" onSubmit={handleConsultationSubmit}>
                {/* Date Selection Mode Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">ประเภทการเลือกวันที่</label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="dateMode"
                        value="exact"
                        checked={dateSelectionMode === "exact"}
                        onChange={() => {
                          setDateSelectionMode("exact")
                          setStartDate(null)
                          setEndDate(null)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">วันที่เฉพาะ</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="dateMode"
                        value="range"
                        checked={dateSelectionMode === "range"}
                        onChange={() => {
                          setDateSelectionMode("range")
                          setSelectedDate(null)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">ช่วงวันที่</span>
                    </label>
                  </div>

                  {/* Conditional Date Picker based on mode */}
                  {dateSelectionMode === "exact" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">วันที่ต้องการ</label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                        className="text-gray-600 w-full border rounded-md px-3 py-2"
                        placeholderText="เลือกวันที่เฉพาะ"
                        required
                        minDate={new Date()}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedDate ? `วันที่เลือก: ${selectedDate.toLocaleDateString("th-TH")}` : "เลือกวันที่ที่ต้องการนัดหมาย"}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ช่วงวันที่ที่สะดวก</label>
                      <DatePicker
                        selected={startDate}
                        onChange={(dates) => {
                          const [start, end] = dates as [Date | null, Date | null]
                          setStartDate(start)
                          setEndDate(end)
                        }}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        dateFormat="dd/MM/yyyy"
                        className="text-gray-600 w-full border rounded-md px-3 py-2"
                        placeholderText="เลือกช่วงวันที่ที่สะดวก"
                        required
                        minDate={new Date()}
                        isClearable
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {startDate && endDate
                          ? `ช่วงวันที่: ${startDate.toLocaleDateString("th-TH")} - ${endDate.toLocaleDateString("th-TH")}`
                          : startDate
                            ? `วันที่เริ่มต้น: ${startDate.toLocaleDateString("th-TH")}`
                            : "เลือกช่วงวันที่ที่คุณสะดวก"}
                      </div>
                    </div>
                  )}
                </div>

                {dateSelectionMode === "exact" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">เวลาที่ต้องการ</label>
                    <DatePicker
                      selected={selectedTime}
                      onChange={(time) => setSelectedTime(time)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption="เวลา"
                      dateFormat="HH:mm"
                      className="text-gray-600 w-full border rounded-md px-3 py-2"
                      placeholderText="เลือกเวลา"
                      required
                      minTime={(() => {
                        const referenceDate = selectedDate
                        return referenceDate && isToday(referenceDate)
                          ? new Date()
                          : new Date(new Date().setHours(8, 0))
                      })()}
                      maxTime={new Date(new Date().setHours(18, 0))}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    className="text-gray-600 w-full border rounded-md px-3 py-2"
                    rows={3}
                    value={consultationDetails}
                    onChange={(e) => setConsultationDetails(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติม เช่น ความต้องการพิเศษ หรือหัวข้อที่ต้องการปรึกษา"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-700 text-white py-2 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={consultationLoading}
                >
                  {consultationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                      กำลังส่ง...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      ยืนยันการส่งคำขอและสร้างคดี
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">คำแนะนำในการสร้างคดี:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• ระบุรายละเอียดของปัญหากฎหมายอย่างชัดเจน</li>
            <li>• เลือกประเภทของคดีให้ตรงกับปัญหา</li>
            <li>• แนบเอกสารประกอบที่เกี่ยวข้อง</li>
            <li>• เพิ่มหมายเหตุหรือคำขอพิเศษในส่วนของหมายเหตุ</li>
            <li>• เลือกทนายความที่เหมาะสมและส่งคำขอปรึกษา</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
