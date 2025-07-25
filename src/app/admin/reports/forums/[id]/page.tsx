"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface ForumReport {
  _id: string
  forum_id: {
    _id: string
    title: string
    content: string
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
  const { toast } = useToast()

  useEffect(() => {
    const fetchReport = async () => {
      if (!session?.accessToken || !id) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        // FIX: Changed from apiFetch to native fetch for GET request
        const response = await fetch(`${backendUrl}/api/v1/report/forum/${id}`, {
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
          setReport(data.data)
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่พบข้อมูลรายงานกระทู้",
            variant: "destructive",
          })
          router.push("/admin/reports/forums") // Corrected path
        }
      } catch (error: any) {
        console.error("Error fetching report:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงานกระทู้",
          variant: "destructive",
        })
        router.push("/admin/reports/forums") // Corrected path
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [session, id, router, toast]) // Added toast to dependency array

  const handleResolveReport = async () => {
    if (!session?.accessToken || !report) return
    setSaving(true)
    try {
      // FIX: Changed from apiFetch to native fetch for PUT request
      const response = await fetch(`${backendUrl}/api/v1/report/forum/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status: "resolved" }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดรายละเอียดรายงาน...</div>
  }

  if (!report) {
    return <div className="text-center py-8 text-red-500">ไม่พบรายงาน</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">รายละเอียดรายงานกระทู้: {report._id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลรายงาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>หัวข้อกระทู้</Label>
            <Input value={report.forum_id?.title || "กระทู้ถูกลบแล้ว"} readOnly />
            {report.forum_id && (
              <Link
                href={`/admin/forums/${report.forum_id._id}`}
                className="text-blue-600 hover:underline text-sm mt-1 block"
              >
                (ดูรายละเอียดกระทู้)
              </Link>
            )}
          </div>
          <div>
            <Label>เนื้อหากระทู้</Label>
            <Textarea value={report.forum_id?.content || "ไม่พบเนื้อหา"} readOnly rows={5} />
          </div>
          <div>
            <Label>ผู้รายงาน</Label>
            <Input value={report.reporter_id?.name || "ไม่ระบุ"} readOnly />
          </div>
          <div>
            <Label>อีเมลผู้รายงาน</Label>
            <Input value={report.reporter_id?.email || "ไม่ระบุ"} readOnly />
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
          {report.status === "pending" && (
            <Button onClick={handleResolveReport} disabled={saving}>
              {saving ? "กำลังบันทึก..." : "ทำเครื่องหมายว่าแก้ไขแล้ว"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}