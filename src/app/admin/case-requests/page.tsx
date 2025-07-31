"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, XCircle, Trash2 } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface CaseRequest {
  _id: string
  client_id: {
    _id: string
    name: string
  }
  lawyer_id?: {
    _id: string
    name: string
  }
  category_type: string
  description: string
  consultation_status: "pending" | "cancelled" | "active" | "rejected"
  createdAt: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export default function AdminCaseRequestsPage() {
  const { data: session } = useSession()
  const [caseRequests, setCaseRequests] = useState<CaseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [filterStatus, setFilterStatus] = useState<string>("ทั้งหมด")
  const [filterCategory, setFilterCategory] = useState<string>("ทั้งหมด")
  const [searchTerm, setSearchTerm] = useState<string>("")

  const fetchCaseRequests = async () => {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      // FIX: Changed from apiFetch to native fetch for GET request
      const response = await fetch(`${backendUrl}/api/v1/caseRequest`, {
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

      const data: ApiResponse<CaseRequest[]> = await response.json()

      if (data.success) {
        setCaseRequests(data.data || [])
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถดึงข้อมูลคำขอคดีได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching case requests:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลคำขอคดี",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchCaseRequests()
    }
  }, [session])

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>()
    caseRequests.forEach((request) => categories.add(request.category_type))
    return ["ทั้งหมด", ...Array.from(categories).sort()]
  }, [caseRequests])

  const filteredCaseRequests = useMemo(() => {
    return caseRequests
      .filter((request) => {
        const matchesStatus =
          filterStatus === "ทั้งหมด" || request.consultation_status === filterStatus
        const matchesCategory =
          filterCategory === "ทั้งหมด" || request.category_type === filterCategory
        const matchesSearch =
          searchTerm === "" ||
          request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.client_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.lawyer_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [caseRequests, filterStatus, filterCategory, searchTerm])

  const handleResetFilters = () => {
    setFilterStatus("ทั้งหมด")
    setFilterCategory("ทั้งหมด")
    setSearchTerm("")
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคำขอคดีนี้?")) return
    try {
      // FIX: Changed from apiFetch to native fetch for DELETE request
      const response = await fetch(`${backendUrl}/api/v1/caseRequest/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const res: ApiResponse<any> = await response.json()

      if (res.success) {
        toast({
          title: "สำเร็จ",
          description: "ลบคำขอคดีเรียบร้อยแล้ว",
        })
        setCaseRequests((prev) => prev.filter((item) => item._id !== id))
      } else {
        throw new Error(res.message || "ลบไม่สำเร็จ")
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบคำขอได้",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#242940] text-white">
        กำลังโหลดข้อมูลคำขอคดี...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">การจัดการคำขอคดี</h1>
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="ค้นหาด้วยรหัสคดี, ชื่อผู้ร้องขอ, หรือทนายความ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm flex-grow bg-white/10 text-white border-white/20 placeholder:text-white/70 focus:ring-white/30 focus:border-white/30"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-white/10 text-white border-white/20">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="ทั้งหมด">สถานะทั้งหมด</SelectItem>
              <SelectItem value="pending">รอดำเนินการ</SelectItem>
              <SelectItem value="active">กำลังดำเนินการ</SelectItem>
              <SelectItem value="rejected">ถูกปฏิเสธ</SelectItem>
              <SelectItem value="cancelled">ยกเลิก</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px] bg-white/10 text-white border-white/20">
              <SelectValue placeholder="ประเภทคดีทั้งหมด" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "ทั้งหมด" ? "ประเภทคดีทั้งหมด" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filterStatus !== "ทั้งหมด" ||
            filterCategory !== "ทั้งหมด" ||
            searchTerm !== "") && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="gap-2 bg-transparent text-white border border-white/20 hover:bg-white/10 hover:text-white"
              >
                <XCircle className="h-4 w-4" />              ล้างตัวกรอง
              </Button>
            )}
        </div>
        <Card className="bg-white rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">รายการคำขอคดีทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCaseRequests.length === 0 ? (
              <p className="text-center text-gray-500">
                ไม่พบข้อมูลคำขอคดีที่ตรงกับตัวกรอง</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-600">รหัสคดี</TableHead>
                      <TableHead className="text-gray-600">ผู้ร้องขอ</TableHead>
                      <TableHead className="text-gray-600">ทนายความที่รับผิดชอบ</TableHead>
                      <TableHead className="text-gray-600">ประเภทคดี</TableHead>
                      <TableHead className="text-gray-600">สถานะ</TableHead>
                      <TableHead className="text-gray-600">วันที่สร้าง</TableHead>
                      <TableHead className="text-right text-gray-600">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCaseRequests.map((request) => (
                      <TableRow
                        key={request._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <TableCell className="font-medium text-gray-900">{request._id}</TableCell>
                        <TableCell className="text-gray-800">{request.client_id?.name || "ไม่ระบุ"}</TableCell>
                        <TableCell className="text-gray-800">{request.lawyer_id?.name || "ยังไม่ระบุ"}</TableCell>
                        <TableCell className="text-gray-800">{request.category_type}</TableCell>
                        <TableCell className="text-gray-800">{request.consultation_status}</TableCell>
                        <TableCell className="text-gray-800">{new Date(request.createdAt).toLocaleDateString("th-TH")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-100"
                              >
                                <span className="sr-only">เปิดเมนู</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white text-gray-900">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/case-requests/${request._id}`}
                                  className="flex items-center text-gray-900 hover:bg-gray-100"
                                >
                                  <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียด
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(request._id)}
                                className="text-red-600 hover:bg-red-100 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> ลบคำขอ
                              </DropdownMenuItem>
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
      </div>
    </div>
  )
}