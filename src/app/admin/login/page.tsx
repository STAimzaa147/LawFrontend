"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })
      if (result?.error) {
        toast({
          title: "เข้าสู่ระบบไม่สำเร็จ",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: "ยินดีต้อนรับสู่แผงควบคุมผู้ดูแลระบบ",
        })
        router.push("/admin")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#242940] p-4">
      <Card className="w-full max-w-md rounded-[2rem] p-6 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Admin Log In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-xl bg-gray-100 border-none text-lg placeholder-gray-500 px-5"
              />
            </div>
            <div>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 rounded-xl bg-gray-100 border-none text-lg placeholder-gray-500 px-5"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-14 rounded-xl bg-[#3A405A] text-white text-lg font-semibold hover:bg-[#4A506A]"
              disabled={loading}
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "Log In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
