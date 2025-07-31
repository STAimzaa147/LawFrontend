"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Gavel, Newspaper, FileText, MessageSquare, BookOpen } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface DashboardStats {
  totalUsers: number
  registeredLawyers: number
  totalNews: number
  totalCaseRequests: number
  totalArticles: number
  totalForums: number
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!session?.accessToken) return
      setLoading(true)
      try {
        // FIX: Changed from apiFetch to native fetch for GET request
        const response = await fetch(`${backendUrl}/api/v1/admin/dashboard/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.accessToken}`, // Correct way to pass token
          },
        })

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<DashboardStats> = await response.json()

        if (data.success) {
          setStats(data.data || null) // Ensure data.data is handled if it could be undefined
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: data.message || "ไม่สามารถดึงข้อมูลสถิติแดชบอร์ดได้",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลสถิติแดชบอร์ด",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardStats()
  }, [session, toast])

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูลแดชบอร์ด...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">แดชบอร์ดผู้ดูแลระบบ</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card for Total Users */}
        <Card className="cursor-pointer bg-white hover:bg-gray-100 transition-colors" onClick={() => router.push("/admin/users")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? "N/A"}</div>
          </CardContent>
        </Card>
        {/* Card for Registered Lawyers */}
        <Card
          className="cursor-pointer bg-white hover:bg-gray-100 transition-colors"
          onClick={() => router.push("/admin/lawyers")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ทนายความที่ลงทะเบียน</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.registeredLawyers ?? "N/A"}</div>
          </CardContent>
        </Card>
        {/* Card for News */}
        <Card className="cursor-pointer bg-white hover:bg-gray-100 transition-colors" onClick={() => router.push("/admin/news")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ข่าวสาร</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalNews ?? "N/A"}</div>
          </CardContent>
        </Card>
        {/* Card for New Case Requests */}
        <Card
          className="cursor-pointer bg-white hover:bg-gray-100 transition-colors"
          onClick={() => router.push("/admin/case-requests")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คำขอคดีใหม่</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCaseRequests ?? "N/A"}</div>
          </CardContent>
        </Card>
        {/* Card for Total Forums */}
        <Card
          className="cursor-pointer bg-white hover:bg-gray-100 transition-colors"
          onClick={() => router.push("/admin/forums")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ฟอรัมทั้งหมด</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalForums ?? "N/A"}</div>
          </CardContent>
        </Card>
        {/* Card for Total Articles */}
        <Card
          className="cursor-pointer bg-white hover:bg-gray-100 transition-colors"
          onClick={() => router.push("/admin/articles")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">บทความทั้งหมด</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArticles ?? "N/A"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}