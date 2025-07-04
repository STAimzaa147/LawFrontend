"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, Plus, Calendar, User, ChevronDown, FileText, Scale } from "lucide-react"

type Case = {
  _id: string
  client_id: {
    _id: string
    name: string
    photo: string
  }
  lawyer_id: {
    _id: string
    name: string
    photo: string
  }
  category_type: string
  description: string
  consultation_status: string
  createdAt: string
  updatedAt: string
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function CasePage() {
  const [cases, setCases] = useState<Case[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${backendUrl}/api/v1/caseRequest/client`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          cache: "no-store",
        })
        const data = await res.json()
        if (data.success) {
          setCases(data.data)
          console.log("fetch case data : ", data.data)
        }
      } catch (error) {
        console.error("Error fetching cases:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.accessToken) {
      fetchCases()
    }
  }, [session?.accessToken, session?.user.id])

  // Extract unique statuses from cases
  const statuses = Array.from(new Set(cases.map((case_item) => case_item.consultation_status).filter(Boolean)))

  // Filter cases by search term and selected status
  const filteredCases = cases.filter((case_item) => {
    const matchesSearch =
      case_item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_item.category_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_item.lawyer_id.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || case_item.consultation_status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const handleAddCaseClick = () => {
    if (session?.user) {
      router.push("/case/create")
    } else {
      alert("You must be logged in to add a case.")
      router.push("/api/auth/signin")
    }
  }

  const handleDeleteCase = async (caseId: string) => {
    const confirmed = confirm("Are you sure you want to delete this case?")
    if (!confirmed) return

    try {
      const res = await fetch(`${backendUrl}/api/v1/caseRequest/${caseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (res.ok) {
        setCases((prev) => prev.filter((c) => c._id !== caseId))
        router.refresh();
      } else {
        alert("Failed to delete case.")
      }
    } catch (error) {
      console.error("Error deleting case:", error)
      alert("An error occurred while deleting the case.")
    }
  }

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status)
    setIsDropdownOpen(false)
  }

  const truncateDescription = (description: string, limit = 100) => {
    if (description.length <= limit) return description
    return description.substring(0, limit) + "..."
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (!session) {
  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center">
      <div className="text-center">
        <Scale className="w-16 h-16 text-white mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">ปฏิเสธการเข้าถึง</h1>
        <p className="text-gray-300 mb-4">คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถดูคดีของคุณได้</p>
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-3">
          <Scale className="w-8 h-8 text-[#C9A55C]" />
          <h1 className="text-2xl font-bold text-white">คดีของฉัน</h1>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <main className="max-w-6xl mx-auto p-6">
      {/* Search, Status Filter, and Add Button */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาคดี..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-white text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition flex items-center gap-2 font-medium shadow-sm border min-w-[140px]"
          >
            {selectedStatus === "all" ? "สถานะทั้งหมด" : selectedStatus}
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
              <div className="py-1">
                <button
                  onClick={() => handleStatusSelect("all")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    selectedStatus === "all" ? "bg-blue-50 text-blue-700" : "text-gray-700"
                  }`}
                >
                  สถานะทั้งหมด
                </button>
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedStatus === status ? "bg-blue-50 text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAddCaseClick}
          className="bg-[#C9A55C] text-white px-6 py-3 rounded-full hover:bg-[#C9A55C]/80 text-gray-200 transition flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          เพิ่มคดีใหม่
        </button>
      </div>

      {/* Active Filters Display */}
      {(selectedStatus !== "all" || searchTerm) && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-gray-300 text-sm">กรองโดย:</span>
          {selectedStatus !== "all" && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              สถานะ: {selectedStatus}
              <button onClick={() => setSelectedStatus("all")} className="text-blue-600 hover:text-blue-800 ml-1">
                ×
              </button>
            </span>
          )}
          {searchTerm && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              ค้นหา: {searchTerm}
              <button onClick={() => setSearchTerm("")} className="text-green-600 hover:text-green-800 ml-1">
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Cases */}
      {loading ? (
        <div className="text-center mt-20 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-50 mx-auto mb-4"></div>
          <p className="text-gray-300">กำลังโหลดคดี...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center mt-20">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {searchTerm || selectedStatus !== "all"
              ? "ไม่พบคดีที่ตรงกับเงื่อนไขการค้นหา"
              : "ยังไม่มีคดี"}
          </p>
          {(searchTerm || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedStatus("all")
              }}
              className="mt-4 text-blue-400 hover:text-blue-300 underline"
            >
              ล้างตัวกรอง
            </button>
          )}
          {!searchTerm && selectedStatus === "all" && (
            <button
              onClick={handleAddCaseClick}
              className="mt-4 bg-[#C9A55C] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              สร้างคดีแรกของคุณ
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Results count */}
          <div className="text-gray-300 text-sm mb-4">
            พบ {filteredCases.length} คดี
            {selectedStatus !== "all" && ` ที่มีสถานะ "${selectedStatus}"`}
          </div>

          {filteredCases.map((case_item) => (
            <div key={case_item._id} className="relative">
              <div onClick={() => router.push(`/case/${case_item._id}`)} className="cursor-pointer">
                <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Status and Type Badges */}
                      <div className="mb-3 flex gap-2">
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded-full ${getStatusColor(
                            case_item.consultation_status
                          )}`}
                        >
                          {case_item.consultation_status}
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          {case_item.category_type}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {truncateDescription(case_item.description)}
                      </p>

                      {/* Lawyer Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">ทนาย:</span>
                        {case_item.lawyer_id?.photo ? (
                          <div className="w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              src={case_item.lawyer_id.photo || "/placeholder.svg"}
                              alt={case_item.lawyer_id.name || "Lawyer"}
                              width={24}
                              height={24}
                              unoptimized
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {case_item.lawyer_id?.name?.charAt(0) || "ท"}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {case_item.lawyer_id?.name || "ยังไม่ได้มอบหมาย"}
                        </span>
                      </div>

                      {/* Date Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>สร้างเมื่อ: {new Date(case_item.createdAt).toLocaleDateString()}</span>
                          </div>
                          {case_item.updatedAt !== case_item.createdAt && (
                            <div className="flex items-center gap-1">
                              <span>อัปเดตล่าสุด: {new Date(case_item.updatedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCase(case_item._id)
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>

    {/* Click outside to close dropdown */}
    {isDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />}
  </div>
)

}
