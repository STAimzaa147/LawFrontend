"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Trash2, X } from "lucide-react"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface ForumReport {
  _id: string
  forum_id: {
    _id: string
    title: string
    content: string
    category?: string
    image?: string
    poster_id?: { _id: string; name: string }
    view_count?: number
    comment_count?: number
    like_count?: number
    createdAt?: string
  }
  reporter_id: {
    _id: string
    name: string
    email: string
  }
  reason: string
  details?: string
  status: "pending" | "resolved"
  createdAt: string
}

export default function AdminForumReportDetailPage() {
  const params = useParams()
  const { id } = params
  const { data: session } = useSession()
  const router = useRouter()
  const [report, setReport] = useState<ForumReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false) // New state for delete loading
  const { toast } = useToast()

  useEffect(() => {
    const fetchReport = async () => {
      if (!session?.accessToken || !id) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const response = await fetch(`${backendUrl}/api/v1/report/forum/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.success) {
          setReport(data.data)
          console.log("Fetched report data:", data.data)
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่พบข้อมูลรายงานกระทู้",
            variant: "destructive",
          })
          router.push("/admin/reports/forums")
        }
      } catch (error: any) {
        console.error("Error fetching report:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงานกระทู้",
          variant: "destructive",
        })
        router.push("/admin/reports/forums")
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [session, id, router, toast])

  const handleResolveReport = async () => {
    if (!session?.accessToken || !report) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะทำเครื่องหมายว่ารายงานนี้ได้รับการแก้ไขแล้ว?")) {
      return
    }
    setSaving(true)
    try {
      const response = await fetch(`${backendUrl}/api/v1/report/forum/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status: "resolved" }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        toast({
          title: "สำเร็จ",
          description: "รายงานได้รับการแก้ไขเรียบร้อยแล้ว",
        })
        setReport((prev) => (prev ? { ...prev, status: "resolved" } : null))
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถแก้ไขรายงานได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error resolving report:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteForum = async () => {
    if (!session?.accessToken || !report?.forum_id?._id) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบกระทู้นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
      return
    }
    setDeleting(true)
    try {
      const response = await fetch(`${backendUrl}/api/v1/forum/${report.forum_id._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        toast({
          title: "สำเร็จ",
          description: "กระทู้ถูกลบเรียบร้อยแล้ว",
        })
        router.push("/admin/reports/forums") // Redirect after successful deletion
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถลบกระทู้ได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error deleting forum:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการลบกระทู้",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center text-white text-lg z-50">
        กำลังโหลดรายละเอียดรายงาน...
      </div>
    )
  }

  if (!report) {
    return (
      <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center text-red-500 text-lg z-50">
        ไม่พบรายงาน
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden mt-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">รายละเอียดรายงานกระทู้</h2>
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Forum Details Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">ข้อมูลกระทู้ที่ถูกรายงาน</h3>
            <div>
              <Label>หัวข้อกระทู้</Label>
              <Input value={report.forum_id?.title || "กระทู้ถูกลบแล้ว"} readOnly/>
            </div>
            <div>
              <Label>เนื้อหากระทู้</Label>
              <Textarea value={report.forum_id?.content || "ไม่พบเนื้อหา"} readOnly rows={5} />
            </div>
            {report.forum_id?.image && (
              <div className="relative w-full h-48 rounded-xl overflow-hidden">
                <Image
                  src={report.forum_id.image || "/placeholder.svg"}
                  alt="Forum Image"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
              <span className="text-gray-500 font-medium">หมวดหมู่:</span>
              <span className="text-gray-700">{report.forum_id?.category || "ไม่ระบุ"}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">ผู้โพสต์:</span>
                <span onClick={() => router.push(`/admin/users/${report.forum_id.poster_id?._id}`)}>{report.forum_id.poster_id?.name || "ไม่ระบุ"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">ยอดวิว:</span>
                <span>{report.forum_id.view_count || 0}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-500">วันที่สร้างกระทู้:</span>
                <span>
                  {report.forum_id?.createdAt
                    ? new Date(report.forum_id.createdAt).toLocaleDateString("th-TH")
                    : "ไม่ระบุ"}
                </span>
              </div>
            </div>
          </div>
          {/* Reporter and Report Details Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">ข้อมูลผู้รายงานและรายละเอียดรายงาน</h3>
            <div>
              <Label>ผู้รายงาน</Label>
              <Input value={report.reporter_id?.name || "ไม่ระบุ"} readOnly />
            </div>
            <div>
              <Label>เหตุผลการรายงาน</Label>
              <Input value={report.reason} readOnly />
            </div>
            <div>
              <Label>รายละเอียดเพิ่มเติม</Label>
              <Textarea value={report.details || "ไม่มี"} readOnly rows={3} />
            </div>
            <div>
              <Label>สถานะ</Label>
              <Input value={report.status === "pending" ? "รอดำเนินการ" : "แก้ไขแล้ว"} readOnly />
            </div>
            <div>
              <Label>วันที่รายงาน</Label>
              <Input value={new Date(report.createdAt).toLocaleDateString("th-TH")} readOnly />
            </div>
          </div>
        </div>
        {/* Footer */}
        {report.status === "pending" && (
          <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-100 bg-gray-50">
            <Button onClick={handleDeleteForum} disabled={deleting || saving} variant="destructive" className="bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-full">
            {deleting ? (
                "กำลังลบ..."
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" /> ลบกระทู้
                </>
              )}
            </Button>
            <Button onClick={handleResolveReport} disabled={saving || deleting} className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors font-medium">
              {saving ? "กำลังบันทึก..." : "ทำเครื่องหมายว่าแก้ไขแล้ว"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
