"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
// import { apiFetch } from "@/lib/api" // apiFetch is no longer used here
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from 'lucide-react' // Import ArrowLeft icon
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "lawyer" | "admin"
  tel?: string
  line_id?: string
  location?: {
    district?: string
    province?: string
  }
  photo?: string
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const { id } = params
  const { data: session } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Helper function to get the full image URL (reused from UserProfile)
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return "" // Return empty string if no image path, to trigger letter fallback
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath
    }
    if (imagePath.startsWith("/")) {
      return imagePath
    }
    return `${backendUrl}/uploads/${imagePath}`
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.accessToken || !id) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        // FIX: Changed from apiFetch to native fetch for GET request
        const response = await fetch(`${backendUrl}/api/v1/admin/user/${id}`, {
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

        if (data.success && data.data) {
          setUser(data.data)
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: data.message || "ไม่พบข้อมูลผู้ใช้",
            variant: "destructive",
          })
          router.push("/admin/users") // Corrected path
        }
      } catch (error: any) {
        console.error("Error fetching user:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
          variant: "destructive",
        })
        router.push("/admin/users") // Corrected path
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [session, id, router, toast, backendUrl])

  const handleSave = async () => {
    if (!session?.accessToken || !user) return
    setSaving(true)
    try {
      const updatedUser = {
        name: user.name,
        email: user.email,
        role: user.role,
        tel: user.tel,
        line_id: user.line_id,
        location: user.location,
      }

      // FIX: Changed from apiFetch to native fetch for PUT request
      const response = await fetch(`${backendUrl}/api/v1/admin/user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(updatedUser),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json()

      if (data.success && data.data) {
        toast({
          title: "สำเร็จ",
          description: "อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว",
        })
        setUser(data.data)
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error saving user:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-gray-700 text-lg">กำลังโหลดข้อมูลผู้ใช้...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-red-500 text-lg">ไม่พบผู้ใช้</div>
      </div>
    )
  }

  // Determine if the current session user is an admin
  const isAdmin = session?.user?.role === "admin"

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-800 px-8 py-6 m-3 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-slate-700"
                aria-label="Go back"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-400 flex-shrink-0 relative flex items-center justify-center text-white text-2xl font-bold">
                {user.photo ? (
                  <Image
                    src={getImageUrl(user.photo) || "/placeholder.svg"}
                    alt="User avatar"
                    fill
                    className="object-cover"
                    unoptimized
                    priority={true}
                    onError={(e) => {
                      console.error("Image load error:", e)
                      // Fallback to letter if image URL fails
                      const target = e.target as HTMLImageElement
                      target.src = "" // Clear src to trigger letter fallback
                    }}
                  />
                ) : (
                  <span>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>
              <h1 className="text-white text-xl font-semibold">{user.name || "ไม่ระบุชื่อ"}</h1>
            </div>
          </div>
        </div>
        {/* Form Section */}
        <div className="bg-gray-50 px-8 py-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
          <div className="space-y-4">
            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ
                </Label>
                <Input
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full px-4 py-3 text-black bg-gray-200 rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล
                </Label>
                <Input
                  id="email"
                  value={user.email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors cursor-not-allowed"
                />
              </div>
            </div>
            {/* Row 2: Phone and Line ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="tel" className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </Label>
                <Input
                  id="tel"
                  value={user.tel || ""}
                  onChange={(e) => setUser({ ...user, tel: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="line_id" className="block text-sm font-medium text-gray-700 mb-2">
                  ไลน์ไอดี
                </Label>
                <Input
                  id="line_id"
                  value={user.line_id || ""}
                  onChange={(e) => setUser({ ...user, line_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly
                />
              </div>
            </div>
            {/* Row 3: District and Province */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                  ตำบล
                </Label>
                <Input
                  id="district"
                  value={user.location?.district || ""}
                  onChange={(e) =>
                    setUser((prev) => ({ ...prev!, location: { ...prev?.location, district: e.target.value } }))
                  }
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
                  จังหวัด
                </Label>
                <Input
                  id="province"
                  value={user.location?.province || ""}
                  onChange={(e) =>
                    setUser((prev) => ({ ...prev!, location: { ...prev?.location, province: e.target.value } }))
                  }
                  className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors"
                  readOnly
                />
              </div>
            </div>
            {/* Role Select (moved to bottom) */}
            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                บทบาท
              </Label>
              <Select
                value={user.role}
                onValueChange={(value: "user" | "lawyer" | "admin") => setUser({ ...user, role: value })}
                disabled={!isAdmin} // Disable if not admin
              >
                <SelectTrigger className="w-full px-4 py-3 bg-gray-200 text-black rounded-lg border-0 focus:ring-2 focus:ring-slate-500 focus:bg-white transition-colors">
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">ผู้ใช้</SelectItem>
                  <SelectItem value="lawyer">ทนายความ</SelectItem>
                  <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !isAdmin} // Disable if saving or not admin
              className="bg-slate-700 text-white px-8 py-3 rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}