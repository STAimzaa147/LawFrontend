"use client"
import type React from "react"
import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Phone, Star, User, X, Plus, Eye, Heart } from "lucide-react"
import Image from "next/image"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { HiChevronLeft, HiChevronRight } from "react-icons/hi"
import Link from "next/link"
import ReviewMenu from "../../../components/review-menu"

interface Location {
  district: string
  province: string
}

interface LawyerUser {
  _id: string
  name: string
  tel: string
  location: Location
  photo?: string
}

interface Lawyer {
  _id: LawyerUser
  slogan: string
  summary: string
  lawfirm_name: string
  consultationRate: {
    min: number
    max: number
  }
  documentDeliveryRate?: {
    min: number
    max: number
  }
  civilCase_specialized: string[]
  criminalCase_specialized: string[]
  has_law_license: boolean
  is_verified_by_council: boolean
  verificationDocs: string[]
  createdAt: string
  updatedAt: string
}

interface UserCase {
  _id: string
  title: string
  description: string
  category_type: string
  consultation_status: string
  lawyer_id?: string
  note: string
}

// Updated Article interface to match your model
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
  like_count: number // Added by controller
  createdAt: string
  updatedAt: string
}

// Add Review interface
interface Review {
  _id: string
  user_id: {
    _id: string
    name: string
    photo?: string
  }
  lawyer_id: string
  rating: number
  comment: string
  case_id?: {
    _id: string
    title: string
  }
  createdAt: string
  updatedAt: string
}

function isToday(date: Date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

export default function LawyerProfilePage() {
  const [lawyer, setLawyer] = useState<Lawyer | null>(null)
  const [userCases, setUserCases] = useState<UserCase[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [reviews, setReviews] = useState<Review[]>([]) // Add reviews state
  const [loading, setLoading] = useState(true)
  const [casesLoading, setCasesLoading] = useState(false)
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(false) // Add reviews loading state
  const params = useParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [details, setDetails] = useState("")
  const { data: session } = useSession()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dateSelectionMode, setDateSelectionMode] = useState<"exact" | "range">("exact")
  const [startIndex, setStartIndex] = useState(0)
  const [cardsToShow, setCardsToShow] = useState(2)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewCaseId, setReviewCaseId] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  // Add function to fetch reviews
  const fetchLawyerReviews = useCallback(
    async (lawyerId: string) => {
      setReviewsLoading(true)
      try {
        const response = await fetch(`${backendUrl}/api/v1/review/lawyer/${lawyerId}`, {
          cache: "no-store",
        })
        if (response.ok) {
          const result = await response.json()
          console.log("Reviews API response:", result) // Debug log
          if (result.success && result.data) {
            // Ensure result.data is an array
            const reviewsData = Array.isArray(result.data) ? result.data : []
            setReviews(reviewsData)
          } else {
            console.log("No reviews data or unsuccessful response")
            setReviews([])
          }
        } else {
          console.error("Failed to fetch reviews:", response.statusText)
          setReviews([])
        }
      } catch (error) {
        console.error("Error fetching lawyer reviews:", error)
        setReviews([])
      } finally {
        setReviewsLoading(false)
      }
    },
    [backendUrl],
  )

  // Updated fetch function to use the correct endpoint
  const fetchLawyerArticles = useCallback(
    async (lawyerId: string) => {
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
    },
    [backendUrl],
  )

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
        const id = params.id as string
        const response = await fetch(`${backendUrl}/api/v1/lawyer/${id}`, {
          cache: "no-store",
        })
        if (!response.ok) {
          router.replace("/not-found")
          return
        }
        const result = await response.json()
        if (result.success) {
          console.log("lawyer data: ", result)
          setLawyer(result.data)
          // Fetch articles using the lawyer's user ID
          fetchLawyerArticles(result.data._id._id)
          // Fetch reviews using the lawyer's user ID
          fetchLawyerReviews(result.data._id._id)
        } else {
          router.replace("/not-found")
        }
      } catch (error) {
        console.error("Error fetching lawyer:", error)
        router.replace("/not-found")
      } finally {
        setLoading(false)
      }
    }
    fetchLawyer()
  }, [params.id, router, fetchLawyerArticles, fetchLawyerReviews])

  // Fetch user's cases without lawyer
  const fetchUserCases = useCallback(async () => {
    if (!session?.accessToken) return
    setCasesLoading(true)
    try {
      const response = await fetch(`${backendUrl}/api/v1/caseRequest/client`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const filteredCases = (result.data as UserCase[]).filter((c) => c.consultation_status === "pending")
          setUserCases(filteredCases)
        }
      }
    } catch (error) {
      console.error("Error fetching user cases:", error)
    } finally {
      setCasesLoading(false)
    }
  }, [backendUrl, session])

  useEffect(() => {
    if (session) {
      fetchUserCases()
    }
  }, [session, backendUrl, fetchUserCases])

  // Handle case creation redirect
  const handleAddCase = () => {
    const returnUrl = `/lawyers/${params.id}`
    router.push(`/case/create?returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  // Check if we're returning from case creation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const caseCreated = urlParams.get("caseCreated")
    if (caseCreated === "true") {
      fetchUserCases()
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [fetchUserCases])

  // Truncate text helper
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Carousel navigation functions
  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - cardsToShow))
  }

  const handleNext = () => {
    setStartIndex(Math.min(articles.length - cardsToShow, startIndex + cardsToShow))
  }

  // Get visible articles
  const visibleArticles = articles.slice(startIndex, startIndex + cardsToShow)

  // Update cardsToShow based on screen size (you can also use useEffect with window resize)
  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1)
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2)
      } else {
        setCardsToShow(2)
      }
    }
    updateCardsToShow()
    window.addEventListener("resize", updateCardsToShow)
    return () => window.removeEventListener("resize", updateCardsToShow)
  }, [])

  // Calculate average rating
  const averageRating =
    Array.isArray(reviews) && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
      : 0

  // Render star rating
  const renderStars = (rating: number, size = "w-5 h-5") => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  // Review menu handlers
  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setReviewRating(review.rating)
    setReviewComment(review.comment)
    setReviewCaseId(review.case_id?._id || "")
    setShowReviewModal(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!session?.accessToken) {
      alert("กรุณาเข้าสู่ระบบ")
      return
    }

    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?")) {
      return
    }

    try {
      const res = await fetch(`${backendUrl}/api/v1/review/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert("เกิดข้อผิดพลาด: " + (errorData.message || res.statusText))
        return
      }

      alert("ลบรีวิวสำเร็จ!")
      // Refresh reviews
      if (lawyer) {
        fetchLawyerReviews(lawyer._id._id)
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error)
    }
  }

  const handleReportReview = (reviewId: string) => {
    // Implement report functionality
    alert("รายงานรีวิวเรียบร้อยแล้ว : " + {reviewId})
  }

  if (loading) {
    return <div className="text-center p-10 text-gray-500">กำลังโหลดข้อมูล...</div>
  }

  if (!lawyer) {
    return null
  }

  const { _id: user } = lawyer

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const hasValidDate = dateSelectionMode === "exact" ? selectedDate : startDate
    if (!selectedCaseId || !hasValidDate || !selectedTime) {
      const dateError =
        dateSelectionMode === "exact" ? "กรุณาเลือกคดี วันที่ และเวลาที่ต้องการ" : "กรุณาเลือกคดี ช่วงวันที่ และเวลาที่ต้องการ"
      alert(dateError)
      return
    }

    const primaryDate = dateSelectionMode === "exact" ? selectedDate! : startDate!
    const reservationDateTime = new Date(primaryDate)
    reservationDateTime.setHours(selectedTime.getHours())
    reservationDateTime.setMinutes(selectedTime.getMinutes())
    reservationDateTime.setSeconds(0)
    reservationDateTime.setMilliseconds(0)

    const payload = {
      case_id: selectedCaseId,
      note: details,
      offered_Lawyers: lawyer._id,
      date_selection_mode: dateSelectionMode,
      ...(dateSelectionMode === "exact"
        ? {
            preferred_date: selectedDate!.toISOString(),
            preferred_time: selectedTime.toTimeString().slice(0, 5),
          }
        : {
            preferred_date_start: startDate!.toISOString(),
            preferred_date_end: endDate ? endDate.toISOString() : startDate!.toISOString(),
            preferred_time: selectedTime.toTimeString().slice(0, 5),
          }),
    }

    try {
      const res = await fetch(`${backendUrl}/api/v1/caseRequest/${selectedCaseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorData = await res.json()
        alert("เกิดข้อผิดพลาด: " + (errorData.message || res.statusText))
        return
      }
      alert("จองขอคำปรึกษาสำเร็จ!")
      setIsOpen(false)
      setSelectedCaseId("")
      setSelectedDate(null)
      setStartDate(null)
      setEndDate(null)
      setSelectedTime(null)
      setDetails("")
      setDateSelectionMode("exact")
      fetchUserCases()
      router.push(`/case/${selectedCaseId}`)
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error)
    }
  }

  const handleClick = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          receiver_id: lawyer._id._id,
          text: "ผมต้องการขอคำปรึกษาครับ/ค่ะ",
        }),
      })
      if (!res.ok) {
        console.error("Failed to create chat")
        return
      }
      router.push(`/chat`)
    } catch (err) {
      console.error("Error starting chat:", err)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.accessToken) {
      alert("กรุณาเข้าสู่ระบบก่อนให้รีวิว")
      return
    }
    if (reviewRating === 0) {
      alert("กรุณาให้คะแนน")
      return
    }

    setSubmittingReview(true)
    try {
      const payload = {
        lawyer_id: lawyer._id._id,
        rating: reviewRating,
        comment: reviewComment,
        ...(reviewCaseId && { case_id: reviewCaseId }),
      }

      const url = editingReview ? `${backendUrl}/api/v1/review/${editingReview._id}` : `${backendUrl}/api/v1/review`

      const method = editingReview ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert("เกิดข้อผิดพลาด: " + (errorData.message || res.statusText))
        return
      }

      alert(editingReview ? "แก้ไขรีวิวสำเร็จ!" : "ส่งรีวิวสำเร็จ!")
      setShowReviewModal(false)
      setReviewRating(0)
      setReviewComment("")
      setReviewCaseId("")
      setEditingReview(null)
      // Refresh reviews
      fetchLawyerReviews(lawyer._id._id)
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error)
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 mb-4 relative">
                    {user.photo ? (
                      <Image
                        src={user.photo || "/placeholder.svg"}
                        alt={user.name}
                        width={112}
                        height={112}
                        unoptimized
                        className="w-full h-full rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-green-400 flex items-center justify-center shadow-md">
                        <div className="text-4xl">👨‍💼</div>
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{user.name}</h1>
                  <div className="flex gap-1 mb-2">{renderStars(averageRating)}</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {averageRating > 0 ? `${averageRating.toFixed(1)} จาก ${reviews.length} รีวิว` : "ยังไม่มีรีวิว"}
                  </div>
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600 text-sm">
                      {user.location.district}, {user.location.province}
                    </span>
                  </div>
                  <p className="text-lg text-gray-600 italic mb-4">{lawyer.slogan}</p>
                  <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {[...lawyer.civilCase_specialized, ...lawyer.criminalCase_specialized]
                      .slice(0, 10)
                      .map((specialization, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          {specialization}
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={handleClick}
                    className="bg-slate-700 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    ติดต่อทนาย
                  </button>
                </div>
              </div>
              {/* Bio Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6">เกี่ยวกับ {user.name}</h2>
                <div className="space-y-4">
                  <p className="text-gray-700 text-sm leading-relaxed">{lawyer.summary}</p>
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
                          {lawyer.civilCase_specialized.length + lawyer.criminalCase_specialized.length}{" "}
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
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="col-span-2 space-y-6">
              {/* License Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-bold text-gray-900 mb-6">ใบอนุญาต</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 border-2 border-purple-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">สภาทนายความ</h3>
                    <p className="text-gray-700 text-base mb-2">
                      {lawyer.is_verified_by_council ? "ได้รับการยืนยันเป็นสมาชิกแล้ว" : "รอการตรวจสอบสมาชิกภาพ"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      เลขที่ใบอนุญาต - {lawyer.has_law_license ? "444/2024" : "รอดำเนินการ"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Consultation Rates Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-bold text-gray-900 text-xl mb-6">อัตราค่าปรึกษากฎหมาย</h3>
                <div className="space-y-4">
                  <div className="text-gray-700 p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm block mb-1">ค่าปรึกษาเบื้องต้นและให้คำแนะนำทางกฎหมาย (ต่อชั่วโมง):</span>
                    <span className="font-bold text-lg text-slate-700">
                      {lawyer.consultationRate.min} บาท - {lawyer.consultationRate.max} บาท
                    </span>
                  </div>
                  {lawyer.documentDeliveryRate && (
                    <div className="text-gray-700 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm block mb-1">บริการเอกสาร - การจัดเตรียมและตรวจสอบเอกสาร:</span>
                      <span className="font-bold text-lg text-slate-700">
                        {lawyer.documentDeliveryRate.min} บาท - {lawyer.documentDeliveryRate.max} บาท
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* Articles Card - Updated with carousel */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 text-xl">บทความ</h3>
                  <span className="text-gray-500 text-sm">({articles.length} บทความ)</span>
                </div>
                {articlesLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">กำลังโหลดบทความ...</div>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">ยังไม่มีบทความ</div>
                    <p className="text-gray-400 text-sm">ทนายยังไม่ได้เผยแพร่บทความใดๆ</p>
                  </div>
                ) : (
                  <section className="relative">
                    {/* Navigation Buttons */}
                    {articles.length > cardsToShow && (
                      <>
                        <button
                          onClick={handlePrev}
                          disabled={startIndex === 0}
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-slate-700 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <HiChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={startIndex + cardsToShow >= articles.length}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-slate-700 text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <HiChevronRight className="w-5 h-5 text-white" />
                        </button>
                      </>
                    )}
                    {/* Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 px-12">
                      {visibleArticles.map((article) => (
                        <Link
                          key={article._id}
                          href={`/articles/${article._id}`}
                          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 h-full flex flex-col"
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
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
              {/* Reviews Card - Updated with ReviewMenu */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">รีวิว</h2>
                      <span className="text-gray-500">({reviews.length})</span>
                    </div>
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">{renderStars(averageRating, "w-5 h-5")}</div>
                        <span className="text-lg font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  {session && (
                    <button
                      onClick={() => {
                        setEditingReview(null)
                        setReviewRating(0)
                        setReviewComment("")
                        setReviewCaseId("")
                        setShowReviewModal(true)
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      เขียนรีวิว
                    </button>
                  )}
                </div>
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">กำลังโหลดรีวิว...</div>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">ยังไม่มีรีวิว</div>
                    <p className="text-gray-400 text-sm">ยังไม่มีลูกค้าให้รีวิวทนายท่านนี้</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6 max-h-[600px] overflow-y-auto">
                      {Array.isArray(reviews) && reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div key={review._id} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 flex-shrink-0">
                                {review.user_id?.photo ? (
                                  <Image
                                    src={review.user_id.photo || "/placeholder.svg"}
                                    alt={review.user_id.name || "Client"}
                                    width={48}
                                    height={48}
                                    unoptimized
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-green-400 flex items-center justify-center">
                                    <div className="text-lg">👤</div>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900">{review.user_id?.name || "Anonymous"}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString("th-TH", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                    {session && (
                                      <ReviewMenu
                                        isOwner={session.user?.id === review.user_id?._id}
                                        onEdit={() => handleEditReview(review)}
                                        onDelete={() => handleDeleteReview(review._id)}
                                        onReport={() => handleReportReview(review._id)}
                                      />
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 mb-2">{renderStars(review.rating || 0, "w-4 h-4")}</div>
                                {review.case_id && (
                                  <div className="text-xs text-blue-600 mb-2 bg-blue-50 px-2 py-1 rounded inline-block">
                                    คดี: {review.case_id.title}
                                  </div>
                                )}
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {review.comment || "ไม่มีความคิดเห็น"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">ไม่มีรีวิวที่จะแสดง</div>
                      )}
                    </div>
                  </>
                )}
              </div>
              {/* Contact Button */}
              <div className="fixed bottom-12 right-12 z-20">
                <button
                  onClick={() => setIsOpen(true)}
                  className="bg-gray-50 text-slate-700 px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <span>จองขอคำปรึกษา</span>
                  <div className="w-6 h-6 bg-slate-700 bg-opacity-10 rounded-full flex items-center justify-center">
                    <Phone className="w-3 h-3" />
                  </div>
                </button>
              </div>
              {/* Modal Overlay - keeping the existing modal code */}
              {isOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                  style={{ marginTop: 0 }}
                >
                  <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-lg p-6 relative">
                    <button
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl text-black font-bold mb-4 text-center">จองขอคำปรึกษา</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">เลือกคดีของคุณ</label>
                        {casesLoading ? (
                          <div className="text-gray-500 text-sm">กำลังโหลดคดี...</div>
                        ) : (
                          <>
                            <select
                              className="text-gray-600 w-full border rounded-md px-3 py-2 mb-2"
                              value={selectedCaseId}
                              onChange={(e) => setSelectedCaseId(e.target.value)}
                              required
                            >
                              <option value="" disabled>
                                เลือกคดีที่ต้องการปรึกษา
                              </option>
                              {userCases.length === 0 ? (
                                <option value="" disabled>
                                  ไม่มีคดีที่ยังไม่มีทนาย
                                </option>
                              ) : (
                                userCases.map((userCase) => (
                                  <option key={userCase._id} value={userCase._id}>
                                    {userCase.title} ({userCase.description.slice(0, 50)})
                                  </option>
                                ))
                              )}
                            </select>
                            <button
                              type="button"
                              onClick={handleAddCase}
                              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              สร้างคดีใหม่
                            </button>
                          </>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">ประเภทการเลือกวันที่</label>
                        <div className="flex gap-4 mb-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="dateMode"
                              value="exact"
                              color="blue"
                              checked={dateSelectionMode === "exact"}
                              onChange={() => {
                                setDateSelectionMode("exact")
                                setStartDate(null)
                                setEndDate(null)
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">วันที่เฉพาะ</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="dateMode"
                              value="range"
                              checked={dateSelectionMode === "range"}
                              onChange={() => {
                                setDateSelectionMode("range")
                                setSelectedDate(null)
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">ช่วงวันที่</span>
                          </label>
                        </div>
                        {dateSelectionMode === "exact" ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">วันที่ต้องการ</label>
                            <DatePicker
                              selected={selectedDate}
                              onChange={(date) => setSelectedDate(date)}
                              dateFormat="dd/MM/yyyy"
                              className="text-gray-600 w-full border rounded-md px-3 py-2"
                              placeholderText="เลือกวันที่เฉพาะ"
                              required
                              minDate={new Date()}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {selectedDate
                                ? `วันที่เลือก: ${selectedDate.toLocaleDateString("th-TH")}`
                                : "เลือกวันที่ที่ต้องการนัดหมาย"}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ช่วงวันที่ที่สะดวก</label>
                            <DatePicker
                              selected={startDate}
                              onChange={(dates) => {
                                const [start, end] = dates as [Date | null, Date | null]
                                setStartDate(start)
                                setEndDate(end)
                              }}
                              startDate={startDate}
                              endDate={endDate}
                              selectsRange
                              dateFormat="dd/MM/yyyy"
                              className="text-gray-600 w-full border rounded-md px-3 py-2"
                              placeholderText="เลือกช่วงวันที่ที่สะดวก"
                              required
                              minDate={new Date()}
                              isClearable
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {startDate && endDate
                                ? `ช่วงวันที่: ${startDate.toLocaleDateString("th-TH")} - ${endDate.toLocaleDateString("th-TH")}`
                                : startDate
                                  ? `วันที่เริ่มต้น: ${startDate.toLocaleDateString("th-TH")}`
                                  : "เลือกช่วงวันที่ที่คุณสะดวก"}
                            </div>
                          </div>
                        )}
                      </div>
                      {dateSelectionMode === "exact" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">เวลาที่ต้องการ</label>
                          <DatePicker
                            selected={selectedTime}
                            onChange={(time) => setSelectedTime(time)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="เวลา"
                            dateFormat="HH:mm"
                            className="text-gray-600 w-full border rounded-md px-3 py-2"
                            placeholderText="เลือกเวลา"
                            required
                            minTime={(() => {
                              const referenceDate = selectedDate
                              return referenceDate && isToday(referenceDate)
                                ? new Date()
                                : new Date(new Date().setHours(8, 0))
                            })()}
                            maxTime={new Date(new Date().setHours(18, 0))}
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">รายละเอียดเพิ่มเติม</label>
                        <textarea
                          className="text-gray-600 w-full border rounded-md px-3 py-2"
                          rows={3}
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="รายละเอียดเพิ่มเติม เช่น ความต้องการพิเศษ หรือหัวข้อที่ต้องการปรึกษา"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-slate-700 text-white py-2 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={userCases.length === 0 || !selectedCaseId}
                      >
                        ยืนยันการจอง
                      </button>
                    </form>
                  </div>
                </div>
              )}
              {/* Review Modal */}
              {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-lg p-6 relative">
                    <button
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setShowReviewModal(false)
                        setEditingReview(null)
                        setReviewRating(0)
                        setReviewComment("")
                        setReviewCaseId("")
                      }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl text-black font-bold mb-4 text-center">
                      {editingReview ? "แก้ไขรีวิว" : "เขียนรีวิว"}
                    </h2>
                    <p className="text-gray-600 text-sm text-center mb-6">
                      {editingReview ? "แก้ไขรีวิวของคุณ" : `แบ่งปันประสบการณ์ของคุณกับ ${user.name}`}
                    </p>
                    <form className="space-y-4" onSubmit={handleSubmitReview}>
                      {/* Rating Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ให้คะแนน</label>
                        <div className="flex gap-1 justify-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= reviewRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 hover:text-yellow-300"
                                } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-center text-sm text-gray-500">
                          {reviewRating === 0 && "คลิกเพื่อให้คะแนน"}
                          {reviewRating === 1 && "แย่มาก"}
                          {reviewRating === 2 && "แย่"}
                          {reviewRating === 3 && "ปานกลาง"}
                          {reviewRating === 4 && "ดี"}
                          {reviewRating === 5 && "ดีเยี่ยม"}
                        </p>
                      </div>
                      {/* Case Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">เลือกคดี (ไม่บังคับ)</label>
                        <select
                          className="text-gray-600 w-full border rounded-md px-3 py-2"
                          value={reviewCaseId}
                          onChange={(e) => setReviewCaseId(e.target.value)}
                        >
                          <option value="">ไม่ระบุคดี</option>
                          {userCases.map((userCase) => (
                            <option key={userCase._id} value={userCase._id}>
                              {userCase.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ความคิดเห็น</label>
                        <textarea
                          className="text-gray-600 w-full border rounded-md px-3 py-2"
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="แบ่งปันประสบการณ์ของคุณ..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowReviewModal(false)
                            setEditingReview(null)
                            setReviewRating(0)
                            setReviewComment("")
                            setReviewCaseId("")
                          }}
                          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors"
                          disabled={submittingReview}
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={reviewRating === 0 || submittingReview}
                        >
                          {submittingReview ? "กำลังส่ง..." : editingReview ? "บันทึกการแก้ไข" : "ส่งรีวิว"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
