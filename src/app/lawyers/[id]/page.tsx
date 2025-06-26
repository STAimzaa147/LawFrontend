import { notFound } from "next/navigation"
import { MapPin, Phone, Star, User } from "lucide-react"
import Image from "next/image"

interface Location {
  district: string
  province: string
}

interface LawyerUser {
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

interface ApiResponse {
  success: boolean
  data: Lawyer
  message?: string
}

async function getLawyer(id: string): Promise<Lawyer | null> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  if (!backendUrl) {
    throw new Error("Backend URL not configured")
  }

  try {
    const response = await fetch(`${backendUrl}/api/v1/lawyer/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch lawyer data")
    }

    const result: ApiResponse = await response.json()

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch lawyer data")
    }

    return result.data
  } catch (error) {
    console.error("Error fetching lawyer:", error)
    throw error
  }
}

export default async function LawyerProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const lawyer = await getLawyer(id)

  if (!lawyer) {
    notFound()
  }

  const { _id: user } = lawyer

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="w-28 h-28 mb-4 relative">
                  {user.photo ? (
                    <Image
                      src={user.photo || "/placeholder.svg"}
                      alt={user.name}
                      width={112}
                      height={112}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-green-400 flex items-center justify-center">
                      <div className="text-4xl">👨‍💼</div>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{user.name}</h1>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600 text-sm">
                    {user.location.district}, {user.location.province}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-lg text-gray-600 italic mb-4 before:content-['“'] after:content-['”']">
                  {lawyer.slogan}
                </p>

                {/* Specialization Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {[...lawyer.civilCase_specialized, ...lawyer.criminalCase_specialized]
                    .slice(0, 6)
                    .map((specialization, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {specialization}
                      </div>
                  ))}
                </div>

                {/* Contact Button */}
                <button className="bg-slate-700 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors">
                  ติดต่อทนาย
                </button>
              </div>
            </div>

            {/* Bio Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
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
                        ความเชี่ยวชาญด้านกฎหมายทั้งหมด {lawyer.civilCase_specialized.length + lawyer.criminalCase_specialized.length}{" "}
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
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">ใบอนุญาต</h2>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 border-2 border-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
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
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="font-bold text-gray-900 text-xl mb-6">อัตราค่าปรึกษากฎหมาย</h3>
              <div className="space-y-4">
                <div className="text-gray-700">
                  <span className="text-sm">ค่าปรึกษาเบื้องต้นและให้คำแนะนำทางกฎหมาย (ต่อชั่วโมง): </span>
                  <span className="font-bold text-base">
                    ${lawyer.consultationRate.min} - ${lawyer.consultationRate.max}
                  </span>
                </div>
                {lawyer.documentDeliveryRate && (
                  <div className="text-gray-700">
                    <span className="text-sm">บริการเอกสาร - การจัดเตรียมและตรวจสอบเอกสาร: </span>
                    <span className="font-bold text-base">
                      ${lawyer.documentDeliveryRate.min} - ${lawyer.documentDeliveryRate.max}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Card */}
            <div className="bg-white rounded-3xl p-8 shadow-lg relative">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-gray-900">รีวิว</h2>
                <span className="text-gray-500">(1)</span>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review */}
              <div className="flex gap-4 mb-8">
                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="text-2xl">👨‍💼</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">บริการอย่างมืออาชีพยอดเยี่ยม</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {lawyer.summary.length > 100 ? lawyer.summary.substring(0, 100) + "..." : lawyer.summary}
                  </p>
                  <button className="text-blue-500 text-sm mt-2 hover:underline">อ่านเพิ่มเติม</button>
                </div>
              </div>

              {/* Contact Button */}
              <div className="absolute bottom-8 right-8">
                <button className="bg-slate-700 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <span>ปรึกษากับทนาย</span>
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Phone className="w-3 h-3" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
