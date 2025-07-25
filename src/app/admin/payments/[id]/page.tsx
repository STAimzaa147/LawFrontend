"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface Payment {
  _id: string
  case_id?: {
    _id: string
    client_id?: { _id: string; name: string; email: string }
    lawyer_id?: { _id: string; name: string; email: string }
  }
  status: "pending" | "paid"
  amount: number
  stripeSession_id?: string
  createdAt: string
}

export default function AdminPaymentDetailPage() {
  const params = useParams()
  const { id } = params
  const { data: session } = useSession()
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPayment = async () => {
      if (!session?.accessToken || !id) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        // FIX: Changed from apiFetch to native fetch for GET request
        const response = await fetch(`${backendUrl}/api/v1/payment/${id}`, {
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
          setPayment(data.data)
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่พบข้อมูลการชำระเงิน",
            variant: "destructive",
          })
          router.push("/admin/payments")
        }
      } catch (error: any) {
        console.error("Error fetching payment:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน",
          variant: "destructive",
        })
        router.push("/admin/payments")
      } finally {
        setLoading(false)
      }
    }
    fetchPayment()
  }, [session, id, router, toast]) // Added toast to dependency array

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดรายละเอียดการชำระเงิน...</div>
  }

  if (!payment) {
    return <div className="text-center py-8 text-red-500">ไม่พบการชำระเงิน</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">รายละเอียดการชำระเงิน: {payment._id}</h1>
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลการชำระเงิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>รหัสคดี</Label>
            {payment.case_id?._id ? (
              <Link href={`/admin/case-requests/${payment.case_id._id}`} className="text-blue-600 hover:underline">
                <Input value={payment.case_id._id} readOnly />
              </Link>
            ) : (
              <Input value="ไม่ระบุ" readOnly />
            )}
          </div>
          <div>
            <Label>ผู้ชำระเงิน</Label>
            <Input value={payment.case_id?.client_id?.name || "ไม่ระบุ"} readOnly />
          </div>
          <div>
            <Label>อีเมลผู้ชำระเงิน</Label>
            <Input value={payment.case_id?.client_id?.email || "ไม่ระบุ"} readOnly />
          </div>
          <div>
            <Label>ผู้รับเงิน (ทนายความ)</Label>
            <Input value={payment.case_id?.lawyer_id?.name || "ไม่ระบุ"} readOnly />
          </div>
          <div>
            <Label>อีเมลผู้รับเงิน</Label>
            <Input value={payment.case_id?.lawyer_id?.email || "ไม่ระบุ"} readOnly />
          </div>
          <div>
            <Label>จำนวนเงิน</Label>
            <Input value={`${payment.amount.toFixed(2)} บาท`} readOnly />
          </div>
          <div>
            <Label>สถานะ</Label>
            <Input value={payment.status === "paid" ? "ชำระแล้ว" : "รอดำเนินการ"} readOnly />
          </div>
          <div>
            <Label>รหัส Stripe Session</Label>
            <Input value={payment.stripeSession_id || "ไม่ระบุ"} readOnly />
          </div>
          <div>
            <Label>วันที่สร้าง</Label>
            <Input value={new Date(payment.createdAt).toLocaleDateString("th-TH")} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}