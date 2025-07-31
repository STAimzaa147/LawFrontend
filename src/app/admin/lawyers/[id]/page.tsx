"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Star, MapPin, Eye, Heart, ChevronLeft, ChevronRight, X, Tag } from "lucide-react"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface Location {
  district?: string
  province?: string
}

interface LawyerUser {
  _id: string
  name: string
  email: string
  tel?: string
  location?: Location
  photo?: string
}

interface Lawyer {
  _id: LawyerUser
  slogan: string
  summary: string
  lawfirm_name: string
  consultationRate: { min: number; max: number }
  documentDeliveryRate?: { min?: number; max?: number }
  civilCase_specialized: string[]
  criminalCase_specialized: string[]
  has_law_license: boolean
  is_verified_by_council: boolean
  verificationDocs: string[]
}

interface Article {
  _id: string
  poster_id: {
    _id: string
    name: string
    photo?: string
  }
  title: string
  content: string
  image?: string
  category: string
  view_count: number
  like_count: number
  createdAt: string
  updatedAt: string
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

type ArticleItem = {
  _id: string
  title: string
  content: string
  image?: string
  createdAt: string
  category?: string
  view_count?: number
  like_count?: number
}

const categories = [
  { value: "technology", label: "เทคโนโลยี" },
  { value: "lifestyle", label: "ไลฟ์สไตล์" },
  { value: "business", label: "ธุรกิจ" },
  { value: "health", label: "สุขภาพ" },
  { value: "education", label: "การศึกษา" },
  { value: "travel", label: "ท่องเที่ยว" },
  { value: "food", label: "อาหาร" },
  { value: "sports", label: "กีฬา" },
  { value: "entertainment", label: "บันเทิง" },
  { value: "news", label: "ข่าวสาร" },
  { value: "other", label: "อื่นๆ" },
]

export default function AdminLawyerDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const router = useRouter()
  const [lawyer, setLawyer] = useState<Lawyer | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [startIndex, setStartIndex] = useState(0)
  const { toast } = useToast()

  const [viewingArticle, setViewingArticle] = useState<ArticleItem | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)

  const cardsToShow = 2
  const visibleArticles = articles.slice(startIndex, startIndex + cardsToShow)

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - cardsToShow))
  }

  const handleNext = () => {
    setStartIndex(Math.min(articles.length - cardsToShow, startIndex + cardsToShow))
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const handleViewArticle = async (articleId: string) => {
    if (!session?.accessToken) return

    setViewingArticle(null)
    setArticleLoading(true)

    try {
      const response = await fetch(`${backendUrl}/api/v1/article/${articleId}`, {
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

      const res: ApiResponse<ArticleItem> = await response.json()
      if (res.success && res.data) {
        setViewingArticle(res.data)
      } else {
        toast({
          title: "ไม่พบข้อมูล",
          description: res.message || "ไม่สามารถโหลดบทความได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถโหลดบทความได้",
        variant: "destructive",
      })
    } finally {
      setArticleLoading(false)
    }
  }

  const closeViewModal = () => {
    setViewingArticle(null)
  }

  const fetchLawyerArticles = useCallback(async (lawyerId: string) => {
    setArticlesLoading(true)
    try {
      const response = await fetch(`${backendUrl}/api/v1/article/lawyer/${lawyerId}`, {
        cache: "no-store",
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setArticles(result.data)
        }
      } else {
        console.error("Failed to fetch articles:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching lawyer articles:", error)
    } finally {
      setArticlesLoading(false)
    }
  }, [])

  useEffect(() => {
    const fetchLawyer = async () => {
      if (!session?.accessToken || !id) return
      setLoading(true)
      try {
        const response = await fetch(`${backendUrl}/api/v1/lawyer/${id}`, {
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

        const data: ApiResponse<Lawyer> = await response.json()
        if (data.success && data.data) {
          setLawyer(data.data)
          await fetchLawyerArticles(data.data._id._id)
        } else {
          toast({
            title: "ข้อผิดพลาด",
            description: data.message || "ไม่พบข้อมูลทนายความ",
            variant: "destructive",
          })
          router.push("/admin/lawyers")
        }
      } catch (error: any) {
        console.error("Error fetching lawyer:", error)
        toast({
          title: "ข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลทนายความ",
          variant: "destructive",
        })
        router.push("/admin/lawyers")
      } finally {
        setLoading(false)
      }
    }

    fetchLawyer()
  }, [session, id, router, toast, fetchLawyerArticles])

  const handleSave = async () => {
    if (!session?.accessToken || !lawyer) return
    setSaving(true)
    try {
      const updatedLawyer = {
        slogan: lawyer.slogan,
        summary: lawyer.summary,
        lawfirm_name: lawyer.lawfirm_name,
        consultationRate: lawyer.consultationRate,
        documentDeliveryRate: lawyer.documentDeliveryRate,
        civilCase_specialized: lawyer.civilCase_specialized,
        criminalCase_specialized: lawyer.criminalCase_specialized,
        has_law_license: lawyer.has_law_license,
        is_verified_by_council: lawyer.is_verified_by_council,
        verificationDocs: lawyer.verificationDocs,
      }

      const response = await fetch(`${backendUrl}/api/v1/lawyer/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(updatedLawyer),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse<Lawyer> = await response.json()
      if (data.success) {
        toast({
          title: "สำเร็จ",
          description: "อัปเดตข้อมูลทนายความเรียบร้อยแล้ว",
        })
        if (data.data) {
          setLawyer(data.data)
        }
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: data.message || "ไม่สามารถอัปเดตข้อมูลทนายความได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error saving lawyer:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลทนายความ",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVerification = async (type: "has_law_license" | "is_verified_by_council") => {
    if (!session?.accessToken || !lawyer) return
    setSaving(true)
    try {
      const payload = {
        [type]: !lawyer[type],
      }

      const response = await fetch(`${backendUrl}/api/v1/lawyer/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse<Lawyer> = await response.json()
      if (data.success) {
        toast({
          title: "สำเร็จ",
          description: `อัปเดตสถานะ ${type === "has_law_license" ? "ใบอนุญาต" : "การยืนยันโดยสภา"} เรียบร้อยแล้ว`,
        })
        if (data.data) {
          setLawyer(data.data)
        }
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description:
            data.message || `ไม่สามารถอัปเดตสถานะ ${type === "has_law_license" ? "ใบอนุญาต" : "การยืนยันโดยสภา"} ได้`,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error toggling verification:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะการยืนยัน",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <div className="text-gray-500">กำลังโหลดข้อมูลทนายความ...</div>
        </div>
      </div>
    )
  }

  if (!lawyer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center py-8 text-red-500">ไม่พบข้อมูลทนายความ</div>
      </div>
    )
  }

  const user = lawyer._id

  return (
    <div className="min-h-screen p-6 bg-slate-800">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white pb-2 border-b border-gray-200 flex-grow">
            แก้ไขข้อมูลทนายความ: {user.name}
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl font-bold text-gray-900 text-center">ข้อมูลส่วนตัวทนายความ</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 mb-4 relative">
                      {user.photo ? (
                        <Image
                          src={user.photo || "/placeholder.svg"}
                          alt={user.name}
                          fill
                          unoptimized
                          className="w-full h-full rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-green-400 flex items-center justify-center shadow-md">
                          <div className="text-4xl">👨‍💼</div>
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{user.name}</h2>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600 text-sm">
                        {user.location?.district || "-"}, {user.location?.province || "-"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="slogan">สโลแกน</Label>
                    <Input
                      id="slogan"
                      value={lawyer.slogan}
                      onChange={(e) => setLawyer({ ...lawyer, slogan: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lawfirm_name">ชื่อสำนักงานกฎหมาย</Label>
                    <Input
                      id="lawfirm_name"
                      value={lawyer.lawfirm_name}
                      onChange={(e) => setLawyer({ ...lawyer, lawfirm_name: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bio Card */}
              <Card className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl font-bold text-gray-900">เกี่ยวกับ {user.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="summary">สรุปข้อมูล</Label>
                    <Textarea
                      id="summary"
                      value={lawyer.summary}
                      onChange={(e) => setLawyer({ ...lawyer, summary: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">ประสบการณ์การทำงาน</h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">สำนักงานกฎหมาย: {lawyer.lawfirm_name}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">
                          ความเชี่ยวชาญด้านกฎหมายทั้งหมด{" "}
                          {lawyer.civilCase_specialized.length + lawyer.criminalCase_specialized.length}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">
                          เอกสารยืนยันตัวตนทั้งหมด {lawyer.verificationDocs.length} รายการ
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 space-y-6">
              {/* License Card */}
              <Card className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-xl font-bold text-gray-900">ใบอนุญาต</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_law_license"
                      checked={lawyer.has_law_license}
                      onCheckedChange={() => handleToggleVerification("has_law_license")}
                    />
                    <Label htmlFor="has_law_license">มีใบอนุญาตว่าความ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_verified_by_council"
                      checked={lawyer.is_verified_by_council}
                      onCheckedChange={() => handleToggleVerification("is_verified_by_council")}
                    />
                    <Label htmlFor="is_verified_by_council">ยืนยันโดยสภาทนายความ</Label>
                  </div>
                  <div>
                    <Label>เอกสารยืนยัน (URLs)</Label>
                    {lawyer.verificationDocs.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-700">
                        {lawyer.verificationDocs.map((doc, index) => (
                          <li key={index}>
                            <a
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              เอกสาร {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">ไม่มีเอกสารยืนยัน</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Consultation Rates Card */}
              <Card className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="font-bold text-gray-900 text-xl">อัตราค่าปรึกษากฎหมาย</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="consultationRateMin">อัตราค่าปรึกษา (ต่ำสุด)</Label>
                      <Input
                        id="consultationRateMin"
                        type="number"
                        value={lawyer.consultationRate.min}
                        onChange={(e) =>
                          setLawyer({
                            ...lawyer,
                            consultationRate: {
                              ...lawyer.consultationRate,
                              min: Number.parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="consultationRateMax">อัตราค่าปรึกษา (สูงสุด)</Label>
                      <Input
                        id="consultationRateMax"
                        type="number"
                        value={lawyer.consultationRate.max}
                        onChange={(e) =>
                          setLawyer({
                            ...lawyer,
                            consultationRate: {
                              ...lawyer.consultationRate,
                              max: Number.parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="documentDeliveryRateMin">อัตราค่าส่งเอกสาร (ต่ำสุด)</Label>
                      <Input
                        id="documentDeliveryRateMin"
                        type="number"
                        value={lawyer.documentDeliveryRate?.min || 0}
                        onChange={(e) =>
                          setLawyer({
                            ...lawyer,
                            documentDeliveryRate: {
                              ...lawyer.documentDeliveryRate,
                              min: Number.parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="documentDeliveryRateMax">อัตราค่าส่งเอกสาร (สูงสุด)</Label>
                      <Input
                        id="documentDeliveryRateMax"
                        type="number"
                        value={lawyer.documentDeliveryRate?.max || 0}
                        onChange={(e) =>
                          setLawyer({
                            ...lawyer,
                            documentDeliveryRate: {
                              ...lawyer.documentDeliveryRate,
                              max: Number.parseFloat(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specialization Fields */}
              <Card className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="font-bold text-gray-900 text-xl">ความเชี่ยวชาญ</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label>ความเชี่ยวชาญคดีแพ่ง (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                    <Input
                      value={lawyer.civilCase_specialized.join(", ")}
                      onChange={(e) =>
                        setLawyer({
                          ...lawyer,
                          civilCase_specialized: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>ความเชี่ยวชาญคดีอาญา (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                    <Input
                      value={lawyer.criminalCase_specialized.join(", ")}
                      onChange={(e) =>
                        setLawyer({
                          ...lawyer,
                          criminalCase_specialized: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Articles Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 text-xl">บทความ</h3>
                  <span className="text-gray-500 text-sm">({articles.length} บทความ)</span>
                </div>
                {articlesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mx-auto mb-2"></div>
                    <div className="text-white">กำลังโหลดบทความ...</div>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">ยังไม่มีบทความ</div>
                    <p className="text-gray-400 text-sm">ทนายยังไม่ได้เผยแพร่บทความใดๆ</p>
                  </div>
                ) : (
                  <section className="relative px-4">
                    {" "}
                    {/* Added horizontal padding here */}
                    {/* Navigation Buttons */}
                    {articles.length > cardsToShow && (
                      <>
                        <button
                          onClick={handlePrev}
                          disabled={startIndex === 0}
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-slate-700 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={startIndex + cardsToShow >= articles.length}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-slate-700 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}
                    {/* Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                      {" "}
                      {/* Removed px-12 here */}
                      {visibleArticles.map((article) => (
                        <div
                          key={article._id}
                          onClick={() => handleViewArticle(article._id)}
                          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 h-full flex flex-col cursor-pointer"
                        >
                          <Image
                            src={article.image || "/placeholder.svg?height=200&width=400&query=legal article"}
                            alt={article.title}
                            width={400}
                            height={200}
                            unoptimized
                            className="object-cover w-full h-48"
                          />
                          <div className="p-4 flex flex-col flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-grow">
                                {article.title}
                              </h2>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                                {article.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3 flex-grow mb-4">
                              {truncateText(article.content, 120)}
                            </p>
                            <div className="border-t border-gray-200 pt-3 text-sm text-gray-500 flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{article.view_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{article.like_count}</span>
                                </div>
                              </div>
                              <span>
                                {new Date(article.createdAt).toLocaleString("th-TH", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Forum Rates Card - Placeholder */}
              <Card className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="font-bold text-gray-900 text-xl">ให้คำปรึกษา</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-gray-600">ยังไม่มีกระทู้หรือการให้คำปรึกษาจากทนายความท่านนี้</p>
                </CardContent>
              </Card>

              {/* Reviews Card */}
              <Card className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold text-gray-900">รีวิว</CardTitle>
                    <span className="text-gray-500">(1)</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="flex gap-4 mb-8">
                    <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <div className="text-2xl">👨‍💼</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">บริการอย่างมืออาชีพยอดเยี่ยม</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {/* Placeholder text for review summary */}
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                      </p>
                      <Button variant="link" className="text-blue-500 text-sm mt-2 p-0 h-auto">
                        อ่านเพิ่มเติม
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.push("/admin/lawyers")}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-slate-700 text-white hover:bg-slate-800">
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </div>
        </div>
      </div>
      {/* View Article Modal */}
      {viewingArticle && (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-95 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden mt-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">{session?.user?.name?.charAt(0) || "U"}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{session?.user?.name}</h2>
                </div>
              </div>
              <button
                onClick={closeViewModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            {articleLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 mx-auto mb-2"></div>
                  <div className="text-gray-500">กำลังโหลดบทความ...</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <h1 className="w-full text-xl font-medium text-gray-900">{viewingArticle.title}</h1>
                {viewingArticle.image && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden">
                    <Image
                      src={viewingArticle.image || "/placeholder.svg"}
                      alt={viewingArticle.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="w-full text-gray-700 whitespace-pre-wrap">{viewingArticle.content}</p>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <span className="flex-1 text-gray-700 font-medium">
                    {categories.find((cat) => cat.value === viewingArticle.category)?.label || "ไม่ระบุหมวดหมู่"}
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{viewingArticle.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{viewingArticle.like_count || 0}</span>
                    </div>
                  </div>
                  <span>
                    {new Date(viewingArticle.createdAt).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Footer */}
            {!articleLoading && (
              <div className="flex items-center justify-end p-6 border-t border-gray-100 bg-gray-50">
                <Button
                  onClick={closeViewModal}
                  className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
                >
                  ปิด
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
