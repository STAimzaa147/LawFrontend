"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import {
  ArrowLeft,
  Scale,
  Calendar,
  FileText,
  User,
  Clock,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Download,
  File,
  ImageIcon,
  Save,
  X,
  Plus,
  Upload,
} from "lucide-react"

interface Lawyer {
  _id: string;
  name: string;
  email:string;
  photo?: string;
  specialization?: string[];
}


type CaseDetails = {
  _id: string
  client_id: {
    _id: string
    name: string
    email: string
    photo?: string
  }
  lawyer_id?: Lawyer
  offered_Lawyers: Lawyer[]
  category_type: "civil" | "criminal" | "unknown"
  description: string
  consultation_date?: string
  consultation_status: "pending" | "cancelled" | "confirmed" | "rejected"
  note: string
  files?: string[]
  createdAt: string
  updatedAt: string
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function CaseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [caseData, setCaseData] = useState<CaseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState("")
  const [saveLoading, setSaveLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [deletingFileIndex, setDeletingFileIndex] = useState<number | null>(null)

  const caseId = params.id as string

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${backendUrl}/api/v1/caseRequest/${caseId}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        })
        const data = await res.json()
        if (data.success) {
          console.log(data.data)
          setCaseData(data.data)
          setEditedDescription(data.data.description)
        } else {
          setError(data.message || "ไม่สามารถโหลดรายละเอียดคดีได้")
        }
      } catch (error) {
        console.error("Error fetching case details:", error)
        setError("เกิดข้อผิดพลาดในการโหลดรายละเอียดคดี")
      } finally {
        setLoading(false)
      }
    }

    if (session?.accessToken && caseId) {
      fetchCaseDetails()
    }
  }, [session?.accessToken, caseId])

  const handleDelete = async () => {
    const confirmed = confirm("คุณแน่ใจหรือไม่ที่จะลบคดีนี้? การกระทำนี้ไม่สามารถยกเลิกได้")
    if (!confirmed) return

    setDeleteLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/v1/caseRequest/${caseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (res.ok) {
        router.push("/case")
      } else {
        alert("ไม่สามารถลบคดีได้")
      }
    } catch (error) {
      console.error("Error deleting case:", error)
      alert("เกิดข้อผิดพลาดในการลบคดี")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaveDescription = async () => {
    setSaveLoading(true)
    try {
      const res = await fetch(`${backendUrl}/api/v1/caseRequest/${caseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          description: editedDescription,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCaseData((prev) => (prev ? { ...prev, description: editedDescription } : null))
        setIsEditingDescription(false)
      } else {
        alert("ไม่สามารถบันทึกการเปลี่ยนแปลงได้")
      }
    } catch (error) {
      console.error("Error updating description:", error)
      alert("เกิดข้อผิดพลาดในการบันทึก")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedDescription(caseData?.description || "")
    setIsEditingDescription(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadLoading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("file", file)
      })

      const res = await fetch(`${backendUrl}/api/v1/caseRequest/${caseId}/file`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        // Refresh case data to get updated files
        const updatedRes = await fetch(`${backendUrl}/api/v1/caseRequest/${caseId}`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        })
        const updatedData = await updatedRes.json()
        if (updatedData.success) {
          setCaseData(updatedData.data)
        }
      } else {
        alert("ไม่สามารถอัปโหลดไฟล์ได้")
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์")
    } finally {
      setUploadLoading(false)
      // Reset the input
      event.target.value = ""
    }
  }

  const handleFileDelete = async (fileIndex: number, filename: string) => {
    const confirmed = confirm(`คุณแน่ใจหรือไม่ที่จะลบไฟล์ "${filename}"?`)
    if (!confirmed) return

    setDeletingFileIndex(fileIndex)
    console.log("index : ",fileIndex)
    try {
      const res = await fetch(`${backendUrl}/api/v1/caseRequest/${caseId}/file?idx=${fileIndex}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (res.ok) {
        // Update local state by removing the file
        setCaseData((prev) => {
          if (!prev) return prev
          const updatedFiles = prev.files?.filter((_, index) => index !== fileIndex) || []
          return { ...prev, files: updatedFiles }
        })
      } else {
        alert("ไม่สามารถลบไฟล์ได้")
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      alert("เกิดข้อผิดพลาดในการลบไฟล์")
    } finally {
      setDeletingFileIndex(null)
    }
  }

  const handleFileDownload = (signedUrl: string, filename: string) => {
    const a = document.createElement("a")
    a.href = signedUrl
    a.download = filename
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const getFileIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />
      case "doc":
      case "docx":
        return <FileText className="w-5 h-5 text-blue-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="w-5 h-5 text-green-500" />
      default:
        return <File className="w-5 h-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "civil":
        return "bg-blue-100 text-blue-800"
      case "criminal":
        return "bg-red-100 text-red-800"
      case "unknown":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryText = (category: string) => {
    switch (category.toLowerCase()) {
      case "civil":
        return "คดีแพ่ง"
      case "criminal":
        return "คดีอาญา"
      case "unknown":
        return "ไม่ระบุ"
      default:
        return "ไม่ระบุ"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "ยืนยันแล้ว"
      case "pending":
        return "รอดำเนินการ"
      case "cancelled":
        return "ยกเลิก"
      case "rejected":
        return "ปฏิเสธ"
      default:
        return "ไม่ระบุ"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      case "cancelled":
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Pause className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function extractFilename(url: string) {
    return url.split("?")[0].split("/").pop() || "download"
  }

  const isOwner = session?.user?.id === caseData?.client_id._id

  const handleAccept = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/v1/caseRequest/${caseId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`, // if using auth
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("คุณได้ยอมรับคำขอเรียบร้อยแล้ว");
      router.refresh();
      // You can also refetch or update UI here
    } else {
      console.error(data.message || "เกิดข้อผิดพลาด");
      alert("การยอมรับคำขอล้มเหลว");
    }
  } catch (error) {
    console.error("Error accepting request:", error);
    alert("เกิดข้อผิดพลาดขณะยอมรับคำขอ");
  }
};

// const handleReject = async () => {
//   try {
//     const response = await fetch(`${backendUrl}/api/v1/caseRequest/${caseRequestId}/reject`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${session?.accessToken}`, // if using auth
//       },
//     });

//     const data = await response.json();

//     if (response.ok && data.success) {
//       alert("คุณได้ปฏิเสธคำขอเรียบร้อยแล้ว");
//       // You can also refetch or update UI here
//     } else {
//       console.error(data.message || "เกิดข้อผิดพลาด");
//       alert("การปฏิเสธคำขอล้มเหลว");
//     }
//   } catch (error) {
//     console.error("Error rejecting request:", error);
//     alert("เกิดข้อผิดพลาดขณะปฏิเสธคำขอ");
//   }
// };


  if (!session) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Scale className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-300 mb-4">คุณต้องเข้าสู่ระบบเพื่อดูรายละเอียดคดี</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800">
        <div className="bg-slate-900 border-b border-slate-700">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Scale className="w-8 h-8 text-[#C9A55C]" />
                <h1 className="text-2xl font-bold text-white">กำลังโหลดคดี...</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white border-opacity-50"></div>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-slate-800">
        <div className="bg-slate-900 border-b border-slate-700">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Scale className="w-8 h-8 text-[#C9A55C]" />
                <h1 className="text-2xl font-bold text-white">ไม่พบคดี</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-white text-lg mb-4">{error || "ไม่พบคดี"}</p>
            <button
              onClick={() => router.push("/case")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              กลับไปหน้าคดี
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-800">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/case')} className="text-gray-400 hover:text-white transition">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <Scale className="w-8 h-8 text-[#C9A55C]" />
                <h1 className="text-2xl font-bold text-white">รายละเอียดคดี</h1>
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteLoading ? "กำลังลบ..." : "ลบ"}
                </button>
              </div>
            )}
            {session.user.role === "lawyer" && caseData.consultation_status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  ✅
                  ยอมรับ
                </button>
                {/* <button
                  onClick={handleReject}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                >
                  ❌
                  ปฏิเสธ
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteLoading ? "กำลังลบ..." : "ลบ"}
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Case Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  <span
                    className={`inline-block text-sm px-3 py-1 rounded-full ${getCategoryColor(caseData.category_type)}`}
                  >
                    {getCategoryText(caseData.category_type)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${getStatusColor(caseData.consultation_status)}`}
                  >
                    {getStatusIcon(caseData.consultation_status)}
                    {getStatusText(caseData.consultation_status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">รายละเอียดคดี</h2>
                {isOwner && !isEditingDescription && (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors px-3 py-1 hover:bg-blue-50 rounded-md"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">แก้ไข</span>
                  </button>
                )}
              </div>

              <div className="prose max-w-none">
                {isEditingDescription ? (
                  <div className="space-y-4">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      placeholder="กรอกรายละเอียดคดี..."
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveDescription}
                        disabled={saveLoading}
                        className="flex items-center gap-2 bg-[#353C63] text-white px-4 py-2 rounded-lg hover:bg-[#353C63]/80 transition disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saveLoading ? "กำลังบันทึก..." : "บันทึก"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saveLoading}
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{caseData.description}</p>
                )}
              </div>
            </div>

            {/* Files Section - Always show */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  เอกสารประกอบ ({caseData.files?.length || 0})
                </h3>
                {isOwner && (
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      disabled={uploadLoading}
                    />
                    <button
                      disabled={uploadLoading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {uploadLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                          กำลังอัปโหลด...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          เพิ่มไฟล์
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {caseData.files && caseData.files.length > 0 ? (
                <div className="space-y-3">
                  {caseData.files.map((filename, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">{getFileIcon(filename)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={filename}>
                            {filename}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFileDownload(filename, extractFilename(filename))}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors px-3 py-2 hover:bg-blue-50 rounded-md"
                          title="ดาวน์โหลดไฟล์"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">ดาวน์โหลด</span>
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => handleFileDelete(index, filename)}
                            disabled={deletingFileIndex === index}
                            className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors px-3 py-2 hover:bg-red-50 rounded-md disabled:opacity-50"
                            title="ลบไฟล์"
                          >
                            {deletingFileIndex === index ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-red-600"></div>
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">ยังไม่มีเอกสารประกอบ</p>
                  <p className="text-gray-400 text-sm mb-4">อัปโหลดเอกสารที่เกี่ยวข้องกับคดีนี้</p>
                  {isOwner && (
                    <div className="relative inline-block">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        disabled={uploadLoading}
                      />
                      <button
                        disabled={uploadLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {uploadLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                            กำลังอัปโหลด...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            เพิ่มไฟล์แรก
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Consultation Information */}
            {caseData.consultation_date && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  รายละเอียดการปรึกษา
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">วันที่นัดหมาย:</span> {formatDate(caseData.consultation_date)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">สถานะ:</span>
                    <span
                      className={`ml-2 inline-flex items-center gap-1 text-sm px-2 py-1 rounded-full ${getStatusColor(caseData.consultation_status)}`}
                    >
                      {getStatusIcon(caseData.consultation_status)}
                      {getStatusText(caseData.consultation_status)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {caseData.note && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  หมายเหตุเพิ่มเติม
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{caseData.note}</p>
              </div>
            )}

            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                ข้อมูลลูกความ
              </h3>
              <div className="flex items-center gap-3">
                {caseData.client_id.photo ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={caseData.client_id.photo || "/placeholder.svg"}
                      alt={caseData.client_id.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-lg">{caseData.client_id.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{caseData.client_id.name}</p>
                </div>
              </div>
            </div>
            
            

            {/* Lawyer Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  ทนายความที่รับผิดชอบ
                </h3>

                {caseData.lawyer_id ? (
                  <div className="flex items-center gap-3">
                    {caseData.lawyer_id.photo ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={caseData.lawyer_id.photo || "/placeholder.svg"}
                          alt={caseData.lawyer_id.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-lg">
                          {caseData.lawyer_id.name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{caseData.lawyer_id.name}</p>
                    </div>
                  </div>
                ) : caseData.offered_Lawyers.length > 0 ? (
                  <div className="space-y-4">
                    {caseData.offered_Lawyers.map((lawyer: Lawyer, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        {lawyer.photo ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              src={lawyer.photo || "/placeholder.svg"}
                              alt={lawyer.name}
                              width={48}
                              height={48}
                              unoptimized
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 font-medium text-lg">
                              {lawyer.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{lawyer.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">ยังไม่มีทนายความรับผิดชอบ</p>
                  </div>
                )}
              </div>

            {/* Case Timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                ไทม์ไลน์
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">สร้างคดี</p>
                    <p className="text-xs text-gray-500">{formatDate(caseData.createdAt)}</p>
                  </div>
                </div>
                {caseData.updatedAt !== caseData.createdAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">อัปเดตล่าสุด</p>
                      <p className="text-xs text-gray-500">{formatDate(caseData.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
