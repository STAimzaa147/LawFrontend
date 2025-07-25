"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, CheckCircle, XCircle } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface Lawyer {
  _id: {
    // This represents the populated User data
    _id: string
    name: string
    email: string
    tel?: string
    location?: {
      province?: string
    }
    photo?: string // Added photo property for avatar
  }
  slogan: string
  lawfirm_name: string
  has_law_license: boolean
  is_verified_by_council: boolean
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export default function AdminLawyersPage() {
  const { data: session } = useSession()
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchLawyers = async () => {
    if (!session?.accessToken) return
    setLoading(true)
    try {
      // FIX: Changed from apiFetch to native fetch for GET request
      const response = await fetch(`${backendUrl}/api/v1/lawyer`, {
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

      const data: ApiResponse<Lawyer[]> = await response.json()

      if (data.success) {
        // Sort lawyers from newest to oldest based on their _id._id (which contains a timestamp)
        const sortedLawyers = (data.data || []).sort((a: Lawyer, b: Lawyer) => {
          // Assuming _id._id is a string that can be compared lexicographically for sorting by creation time
          return b._id._id.localeCompare(a._id._id)
        })
        setLawyers(sortedLawyers)
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถดึงข้อมูลทนายความได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching lawyers:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลทนายความ",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchLawyers()
    }
  }, [session])

  const handleChangeVerificationStatus = async (
    lawyerId: string,
    statusType: "has_law_license" | "is_verified_by_council",
    value: boolean,
  ) => {
    if (!session?.accessToken) return
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ที่จะเปลี่ยนสถานะ ${statusType === "has_law_license" ? "มีใบอนุญาต" : "ยืนยันโดยสภา"} ของทนายความนี้เป็น ${value ? "ใช่" : "ไม่ใช่"}?`,
      )
    )
      return
    try {
      // FIX: Changed from apiFetch to native fetch for PUT request
      const response = await fetch(`${backendUrl}/api/v1/lawyer/${lawyerId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ [statusType]: value }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const res: ApiResponse<any> = await response.json()

      if (res.success) {
        toast({
          title: "สำเร็จ",
          description: "อัปเดตสถานะทนายความเรียบร้อยแล้ว",
        })
        fetchLawyers() // Refresh list
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: res.message || "ไม่สามารถอัปเดตสถานะทนายความได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error updating lawyer status:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตสถานะทนายความได้",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#242940] text-white">
        กำลังโหลดข้อมูลทนายความ...</div>
    )
  }

  return (
    <div className="min-h-screen bg-[#242940] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">การจัดการทนายความ</h1>
          {/* No "Add New Lawyer" button in the original table, but if needed, it would go here */}
        </div>
        {lawyers.length === 0 ? (
          <p className="text-center text-gray-300">ไม่พบข้อมูลทนายความ</p>
        ) : (
          <div className="grid gap-6">
            {lawyers.map((lawyer) => (
              <Card key={lawyer._id._id} className="bg-white rounded-xl shadow-lg p-6">
                <CardContent className="p-0">
                  {/* Avatar and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      {lawyer._id.photo ? (
                        <Image
                          src={lawyer._id.photo || "/placeholder.svg"}
                          alt={lawyer._id.name || "User"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-400 flex items-center justify-center">
                          <span className="text-white text-2xl font-medium">
                            {lawyer._id.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {lawyer._id.name || "ไม่ระบุชื่อ"}
                    </span>
                  </div>
                  {/* Lawyer Details (indented) */}
                  <div className="ml-[80px]">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {lawyer.lawfirm_name || "ไม่ระบุสำนักงานกฎหมาย"}
                    </h2>
                    <p className="text-gray-700 mb-3 leading-relaxed">{lawyer.slogan || "ไม่มีสโลแกน"}</p>
                    {/* Verification Statuses and Province */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        มีใบอนุญาต:{" "}
                        {lawyer.has_law_license ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        ยืนยันโดยสภา:{" "}
                        {lawyer.is_verified_by_council ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {lawyer._id.location?.province && (
                        <div className="flex items-center gap-1">จังหวัด: {lawyer._id.location.province}</div>
                      )}
                    </div>
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                      <Link href={`/admin/lawyers/${lawyer._id._id}`}>
                        <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-full">
                          <Pencil className="mr-2 h-4 w-4" /> ดู/แก้ไขโปรไฟล์
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full bg-gray-100 hover:bg-gray-200">
                            <span className="sr-only">เปิดเมนู</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeVerificationStatus(lawyer._id._id, "has_law_license", !lawyer.has_law_license)
                            }
                          >
                            {lawyer.has_law_license ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" /> ยกเลิกใบอนุญาต
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" /> ยืนยันใบอนุญาต
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeVerificationStatus(
                                lawyer._id._id,
                                "is_verified_by_council",
                                !lawyer.is_verified_by_council,
                              )
                            }
                          >
                            {lawyer.is_verified_by_council ? (
                              <>
                                <XCircle className="mr-2 h-4 w-4" /> ยกเลิกการยืนยันสภา
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" /> ยืนยันโดยสภา
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}