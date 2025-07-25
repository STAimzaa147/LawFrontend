"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, CheckCircle } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface CommentReport {
  _id: string
  comment_id: {
    _id: string
    content: string
  }
  reporter_id: {
    _id: string
    name: string
  }
  reason: string
  status: "pending" | "resolved" | "rejected" // Added 'rejected' as a possible status
  createdAt: string
}

export default function AdminCommentReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<CommentReport[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchReports = async () => {
    if (!session?.accessToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // FIX: Changed from apiFetch to native fetch for GET request
      const response = await fetch(`${backendUrl}/api/v1/report/comment`, {
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
        // Sort the reports list from newest to oldest
        const sortedReports = data.data.sort((a: CommentReport, b: CommentReport) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setReports(sortedReports)
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลรายงานความคิดเห็นได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching comment reports:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงานความคิดเห็น",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchReports()
    }
  }, [session, toast]) // Added toast to dependency array

  const handleResolveReport = async (reportId: string) => {
    if (!session?.accessToken) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะทำเครื่องหมายว่ารายงานนี้ได้รับการแก้ไขแล้ว?")) return

    try {
      // FIX: Changed from apiFetch to native fetch for PATCH request
      const response = await fetch(`${backendUrl}/api/v1/report/comment/${reportId}/status`, {
        method: "PATCH", // Changed to PATCH
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

      // No need to parse response if backend sends no content for success, but good practice to check
      // const data = await response.json(); 

      toast({
        title: "สำเร็จ",
        description: "รายงานได้รับการแก้ไขเรียบร้อยแล้ว",
      })
      fetchReports() // Refresh list
    } catch (error: any) {
      console.error("Error resolving report:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถแก้ไขรายงานได้",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-white">กำลังโหลดรายงานความคิดเห็น...</div>
  }

  return (
    <Card className="bg-white rounded-xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900">รายการรายงานความคิดเห็น</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-center text-gray-500">ไม่พบรายงานความคิดเห็น</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-600">รหัสรายงาน</TableHead>
                  <TableHead className="text-gray-600">เนื้อหาความคิดเห็น</TableHead>
                  <TableHead className="text-gray-600">ผู้รายงาน</TableHead>
                  <TableHead className="text-gray-600">เหตุผล</TableHead>
                  <TableHead className="text-gray-600">สถานะ</TableHead>
                  <TableHead className="text-gray-600">วันที่รายงาน</TableHead>
                  <TableHead className="text-right text-gray-600">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">{report._id}</TableCell>
                    <TableCell className="text-gray-800">{report.comment_id?.content || "ความคิดเห็นถูกลบ"}</TableCell>
                    <TableCell className="text-gray-800">{report.reporter_id?.name || "ไม่ระบุ"}</TableCell>
                    <TableCell className="text-gray-800">{report.reason}</TableCell>
                    <TableCell className="text-gray-800">
                      {report.status === "pending"
                        ? "รอดำเนินการ"
                        : report.status === "resolved"
                          ? "แก้ไขแล้ว"
                          : "ถูกปฏิเสธ"}
                    </TableCell>
                    <TableCell className="text-gray-800">{new Date(report.createdAt).toLocaleDateString("th-TH")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-100">
                            <span className="sr-only">เปิดเมนู</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white text-gray-900">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/reports/comments/${report._id}`}
                              className="flex items-center text-gray-900 hover:bg-gray-100"
                            >
                              <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียด
                            </Link>
                          </DropdownMenuItem>
                          {report.status === "pending" && (
                            <DropdownMenuItem
                              onClick={() => handleResolveReport(report._id)}
                              className="flex items-center text-gray-900 hover:bg-gray-100"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" /> ทำเครื่องหมายว่าแก้ไขแล้ว
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}