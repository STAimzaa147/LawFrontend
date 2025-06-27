"use client";

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Phone, Star, User, X } from "lucide-react";
import Image from "next/image";
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface Location {
  district: string;
  province: string;
}

interface LawyerUser {
  _id: string;
  name: string;
  tel: string;
  location: Location;
  photo?: string;
}

interface Lawyer {
  _id: LawyerUser;
  slogan: string;
  summary: string;
  lawfirm_name: string;
  consultationRate: {
    min: number;
    max: number;
  };
  documentDeliveryRate?: {
    min: number;
    max: number;
  };
  civilCase_specialized: string[];
  criminalCase_specialized: string[];
  has_law_license: boolean;
  is_verified_by_council: boolean;
  verificationDocs: string[];
  createdAt: string;
  updatedAt: string;
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
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false)
  const [caseType, setCaseType] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)
  const [details, setDetails] = useState("")
  const { data: session } = useSession()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const id = params.id as string;

        const response = await fetch(`${backendUrl}/api/v1/lawyer/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/not-found");
          return;
        }

        const result = await response.json();
        if (result.success) {
          setLawyer(result.data);
        } else {
          router.replace("/not-found");
        }
      } catch (error) {
        console.error("Error fetching lawyer:", error);
        router.replace("/not-found");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyer();
  }, [params.id, router]);

  if (loading) {
    return <div className="text-center p-10 text-gray-500">กำลังโหลดข้อมูล...</div>;
  }

  if (!lawyer) {
    return null; // fallback for failed fetch
  }

  const { _id: user } = lawyer;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !caseType) {
      alert("กรุณาเลือกประเภทคดี วันที่ และเวลาที่ต้องการ");
      return;
    }

    // Combine date and time
    const reservationDateTime = new Date(selectedDate);
    reservationDateTime.setHours(selectedTime.getHours());
    reservationDateTime.setMinutes(selectedTime.getMinutes());
    reservationDateTime.setSeconds(0);
    reservationDateTime.setMilliseconds(0);

    // Payload to send
    const payload = {
      category_type : caseType,
      consultation_date: reservationDateTime.toISOString(),
      description:details,
      lawyer_id:lawyer._id._id
    };

    try {
      const res = await fetch(`${backendUrl}/api/v1/caseRequest`, {
         method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("เกิดข้อผิดพลาด: " + (errorData.message || res.statusText));
        return;
      }

      alert("จองขอคำปรึกษาสำเร็จ!");
      setIsOpen(false);
      // Clear form
      setCaseType("");
      setSelectedDate(null);
      setSelectedTime(null);
      setDetails("");
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* White container wrapper */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center">
                  {/* Avatar */}
                  <div className="w-28 h-28 mb-4 relative">
                    {user.photo ? (
                      <Image
                        src={user.photo || "/placeholder.svg"}
                        alt={user.name}
                        width={112}
                        height={112}
                        className="w-full h-full rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-green-400 flex items-center justify-center shadow-md">
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
                  <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {[...lawyer.civilCase_specialized, ...lawyer.criminalCase_specialized]
                      .slice(0, 6)
                      .map((specialization, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          {specialization}
                        </div>
                    ))}
                  </div>

                  {/* Contact Button */}
                  <button className="bg-slate-700 text-white px-8 py-3 rounded-full font-medium hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg">
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

              {/* บทความ Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-bold text-gray-900 text-xl mb-6">บทความ</h3>
                
              </div>

              {/* forum Rates Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-bold text-gray-900 text-xl mb-6">ให้คำปรึกษา</h3>
              </div>

              {/* Reviews Card */}
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative">
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
                  <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <div className="text-2xl">👨‍💼</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">บริการอย่างมืออาชีพยอดเยี่ยม</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {lawyer.summary.length > 100 ? lawyer.summary.substring(0, 100) + "..." : lawyer.summary}
                    </p>
                    <button className="text-blue-500 text-sm mt-2 hover:underline transition-colors">อ่านเพิ่มเติม</button>
                  </div>
                </div>
              </div>
              <>
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
                
                {/* Modal Overlay */}
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

                        {/* Reservation Form */}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">ประเภทคดี</label>
                            <select
                              className="text-gray-600 w-full border rounded-md px-3 py-2"
                              value={caseType}
                              onChange={(e) => setCaseType(e.target.value)}
                              required
                            >
                              <option value="" disabled>
                                เลือกประเภทคดี
                              </option>
                              <option value="criminal">คดีอาญา</option>
                              <option value="civil">คดีแพ่ง</option>
                              <option value="unknown">ไม่ทราบประเภทคดี</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">วันที่ต้องการ</label>
                            <DatePicker
                              selected={selectedDate}
                              onChange={(date) => setSelectedDate(date)}
                              dateFormat="dd/MM/yyyy"
                              className="text-gray-600 w-full border rounded-md px-3 py-2"
                              placeholderText="เลือกวันที่"
                              required
                              minDate={new Date()}
                            />
                          </div>

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
                              minTime={
                                selectedDate && isToday(selectedDate)
                                  ? new Date()
                                  : new Date(new Date().setHours(8, 0))
                              }
                              maxTime={new Date(new Date().setHours(18, 0))}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">รายละเอียดเพิ่มเติม</label>
                            <textarea
                              className="text-gray-600 w-full border rounded-md px-3 py-2"
                              rows={3}
                              value={details}
                              onChange={(e) => setDetails(e.target.value)}
                              placeholder="รายละเอียดเพิ่มเติม"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-slate-700 text-white py-2 rounded-md hover:bg-slate-800"
                          >
                            ยืนยันการจอง
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
