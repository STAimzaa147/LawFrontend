"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"
import { FileText, Download, ArrowLeft } from 'lucide-react'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface CaseRequest {
  _id: string
  client_id: {
    _id: string
    name: string
    email: string
  }
  lawyer_id?: {
    _id: string
    name: string
    email: string
  }
  offered_Lawyers: {
    _id: string
    name: string
  }[]
  category_type: string
  description: string
  consultation_date?: string
  consultation_status: "pending" | "cancelled" | "active" | "rejected"
  note?: string
  files: string[]
  createdAt: string
}

interface LawyerOption {
  _id: string
  name: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export default function AdminCaseRequestDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const router = useRouter()
  const [caseRequest, setCaseRequest] = useState<CaseRequest | null>(null)
  const [lawyerOptions, setLawyerOptions] = useState<LawyerOption[]>([])
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>("none")
  const [newStatus, setNewStatus] = useState<"pending" | "cancelled" | "active" | "rejected">("pending")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken || !id) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        // FIX: Changed from apiFetch to native fetch for GET case request details
        const requestResponse = await fetch(`${backendUrl}/api/v1/caseRequest/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
          },
        })

        if (!requestResponse.ok) {
          const errorData = await requestResponse.json();
          throw new Error(errorData.message || `HTTP error! status: ${requestResponse.status}`);
        }
        const requestData: ApiResponse<CaseRequest> = await requestResponse.json()

        if (requestData.success && requestData.data) {
          setCaseRequest(requestData.data)
          setNewStatus(requestData.data.consultation_status)
          setSelectedLawyerId(requestData.data.lawyer_id?._id || "none")
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: requestData.message || "ไม่พบข้อมูลคำขอคดี",
            variant: "destructive",
          })
          router.push("/admin/case-requests")
        }

        // FIX: Changed from apiFetch to native fetch for GET lawyer options
        const lawyersResponse = await fetch(`${backendUrl}/api/v1/lawyer`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
          },
        })

        if (!lawyersResponse.ok) {
          const errorData = await lawyersResponse.json();
          throw new Error(errorData.message || `HTTP error! status: ${lawyersResponse.status}`);
        }
        const lawyersData: ApiResponse<LawyerOption[]> = await lawyersResponse.json()

        if (lawyersData.success && lawyersData.data) {
          setLawyerOptions(lawyersData.data.map((lawyer: any) => ({
            _id: lawyer._id._id,
            name: lawyer._id.name,
          })),
          )
        }
      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล",
          variant: "destructive",
        })
        router.push("/admin/case-requests")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session, id, router, toast])

  const handleUpdateCaseRequest = async () => {
    if (!session?.accessToken || !caseRequest) return
    setSaving(true)
    try {
      const payload: any = {
        consultation_status: newStatus,
      }
      if (selectedLawyerId !== "none") {
        payload.lawyer_id = selectedLawyerId
      }

      // FIX: Changed from apiFetch to native fetch for PUT request
      const response = await fetch(`${backendUrl}/api/v1/caseRequest/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: ApiResponse<CaseRequest> = await response.json()

      if (data.success) {
        toast({
          title: "สำเร็จ",
          description: "อัปเดตคำขอคดีเรียบร้อยแล้ว",
        })
        // Re-fetch to get updated populated data
        // FIX: Changed from apiFetch to native fetch for re-fetch
        const updatedRequestResponse = await fetch(`${backendUrl}/api/v1/caseRequest/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`,
          },
        })

        if (!updatedRequestResponse.ok) {
          const errorData = await updatedRequestResponse.json();
          throw new Error(errorData.message || `HTTP error! status: ${updatedRequestResponse.status}`);
        }
        const updatedRequestData: ApiResponse<CaseRequest> = await updatedRequestResponse.json()

        if (updatedRequestData.success && updatedRequestData.data) {
          setCaseRequest(updatedRequestData.data)
        }
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถอัปเดตคำขอคดีได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error updating case request:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center text-white text-lg z-50">
        กำลังโหลดข้อมูลคำขอคดี...
      </div>
    )
  }

  if (!caseRequest) {
    return (
      <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center text-red-500 text-lg z-50">
        ไม่พบคำขอคดี
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden mt-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="กลับ"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">รายละเอียดคำขอคดี</h2>
          <div className="w-8 h-8" /> {/* Placeholder for alignment */}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-xl font-medium text-gray-900">คำขอคดี: {caseRequest._id}</h1>
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-name" className="block text-sm font-medium text-gray-700 mb-1">
                ผู้ร้องขอ</Label>
              <Input
                id="client-name"
                value={caseRequest.client_id?.name || "ไม่ระบุ"}
                readOnly
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <div>
              <Label htmlFor="client-email" className="block text-sm font-medium text-gray-700 mb-1">
                อีเมลผู้ร้องขอ</Label>
              <Input
                id="client-email"
                value={caseRequest.client_id?.email || "ไม่ระบุ"}
                readOnly
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
          </div>
          {/* Lawyer Assignment */}
          <div>
            <Label htmlFor="lawyer-assign" className="block text-sm font-medium text-gray-700 mb-1">
              ทนายความที่รับผิดชอบ</Label>
            <Select value={selectedLawyerId} onValueChange={setSelectedLawyerId}>
              <SelectTrigger id="lawyer-assign" className="w-full bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue placeholder="เลือกทนายความ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ยังไม่ระบุ</SelectItem>
                {lawyerOptions.map((lawyer) => (
                  <SelectItem key={lawyer._id} value={lawyer._id}>{lawyer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Offered Lawyers */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">ทนายความที่เสนอตัว</Label>
            {caseRequest.offered_Lawyers && caseRequest.offered_Lawyers.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {caseRequest.offered_Lawyers.map((lawyer) => (
                  <li key={lawyer._id}>{lawyer.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">ไม่มีทนายความเสนอตัว</p>
            )}
          </div>
          {/* Category and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category-type" className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทคดี</Label>
              <Input
                id="category-type"
                value={caseRequest.category_type}
                readOnly
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <div>
              <Label htmlFor="consultation-date" className="block text-sm font-medium text-gray-700 mb-1">
                วันที่ปรึกษา</Label>
              <Input
                id="consultation-date"
                value={caseRequest.consultation_date
                  ? new Date(caseRequest.consultation_date).toLocaleDateString("th-TH")
                  : "ไม่ระบุ"}
                readOnly
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
          </div>
          {/* Description */}
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด</Label>
            <Textarea
              id="description"
              value={caseRequest.description}
              readOnly
              rows={5}
              className="bg-gray-50 border-gray-200 resize-none text-gray-900"
            />
          </div>
          {/* Status */}
          <div>
            <Label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
              สถานะคำขอ</Label>
            <Select
              value={newStatus}
              onValueChange={(value: "pending" | "cancelled" | "active" | "rejected") => setNewStatus(value)}
            >
              <SelectTrigger id="status-select" className="w-full bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="active">ใช้งานอยู่</SelectItem>
                <SelectItem value="cancelled">ยกเลิกโดยผู้ร้องขอ</SelectItem>
                <SelectItem value="rejected">ปฏิเสธโดยทนายความ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Note */}
          <div>
            <Label htmlFor="note-textarea" className="block text-sm font-medium text-gray-700 mb-1">
              หมายเหตุ</Label>
            <Textarea
              id="note-textarea"
              value={caseRequest.note || "ไม่มี"}
              readOnly
              rows={3}
              className="bg-gray-50 border-gray-200 resize-none text-gray-900"
            />
          </div>
          {/* Files */}
          <div>
            <Label className="block text-gray-700 font-medium mb-2">ไฟล์แนบ</Label>
            {caseRequest.files && caseRequest.files.length > 0 ? (
              <ul className="space-y-2">
                {caseRequest.files.map((fileUrl, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate flex-grow text-sm"
                    >
                      ไฟล์แนบ {index + 1}</a>
                    <Button variant="ghost" size="icon" asChild className="text-gray-600 hover:bg-gray-100">
                      <a href={fileUrl} download><Download className="h-4 w-4" /></a>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">ไม่มีไฟล์แนบ</p>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-100 bg-gray-50">
          <Button
            onClick={handleUpdateCaseRequest}
            disabled={saving}
            className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </div>
    </div>
  )
}