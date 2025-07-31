"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface Payment {
  _id: string
  case_id?: {
    _id: string
    client_id?: { _id: string; name: string }
    lawyer_id?: { _id: string; name: string }
  }
  status: "pending" | "paid"
  amount: number
  createdAt: string
}

export default function AdminPaymentsPage() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchPayments = async () => {
    if (!session?.accessToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // FIX: Changed from apiFetch to native fetch for GET request
      const response = await fetch(`${backendUrl}/api/v1/payment`, {
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
        // Sort from newest to oldest
        const sortedPayments = data.data.sort((a: Payment, b: Payment) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setPayments(sortedPayments)
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลการชำระเงินได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching payments:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchPayments()
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#242940] text-white">
        กำลังโหลดข้อมูลการชำระเงิน...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">การจัดการการชำระเงิน</h1>
        <Card className="bg-white rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">รายการการชำระเงินทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center text-gray-500">ไม่พบข้อมูลการชำระเงิน</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-600">รหัสการชำระเงิน</TableHead>
                      <TableHead className="text-gray-600">รหัสคดี</TableHead>
                      <TableHead className="text-gray-600">ผู้ชำระเงิน</TableHead>
                      <TableHead className="text-gray-600">ผู้รับเงิน</TableHead>
                      <TableHead className="text-gray-600">จำนวนเงิน</TableHead>
                      <TableHead className="text-gray-600">สถานะ</TableHead>
                      <TableHead className="text-gray-600">วันที่สร้าง</TableHead>
                      <TableHead className="text-right text-gray-600">การดำเนินการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{payment._id}</TableCell>
                        <TableCell>
                          {payment.case_id?._id ? (
                            <Link
                              href={`/admin/case-requests/${payment.case_id._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {payment.case_id._id}
                            </Link>
                          ) : (
                            <span className="text-gray-800">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-800">{payment.case_id?.client_id?.name || "-"}</TableCell>
                        <TableCell className="text-gray-800">{payment.case_id?.lawyer_id?.name || "-"}</TableCell>
                        <TableCell className="text-gray-800">{payment.amount.toFixed(2)} บาท</TableCell>
                        <TableCell className="text-gray-800">{payment.status === "paid" ? "ชำระแล้ว" : "รอดำเนินการ"}</TableCell>
                        <TableCell className="text-gray-800">{new Date(payment.createdAt).toLocaleDateString("th-TH")}</TableCell>
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
                                  href={`/admin/payments/${payment._id}`}
                                  className="flex items-center text-gray-900 hover:bg-gray-100"
                                >
                                  <Eye className="mr-2 h-4 w-4" /> ดูรายละเอียด
                                </Link>
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