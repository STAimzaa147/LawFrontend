"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import DatePicker from "react-datepicker"
import { useSession } from "next-auth/react"
import Select from "react-select"

interface AddAppointmentModalProps {
  onClose: () => void
  onSave: (userId: string) => void
}

interface UserCase {
  _id: string
  title: string
  description: string
  category_type: string
  consultation_status: string
  lawyer_id?: string
  client_id: string
  note: string
}

export default function AddAppointmentModal({ onClose, onSave }: AddAppointmentModalProps) {
  const { data: session } = useSession()
  const [userCases, setUserCases] = useState<UserCase[]>([])
  const caseOptions = userCases.map((userCase) => ({
    value: userCase._id,
    label: `(${userCase.description.slice(0, 50)})`,
    }))
  const [casesLoading, setCasesLoading] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState("")
  const [formData, setFormData] = useState({
    task: "",
    location: "",
    startTime: "",
    endTime: "",
    date: new Date().toISOString().split("T")[0],
    permission: "",
    note: "",
  })
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [baseDate] = useState(new Date())

  // Helper function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Set time boundaries
  const minSelectableTime = new Date()
  minSelectableTime.setHours(8, 0, 0, 0) // 8:00 AM

  const maxSelectableTime = new Date()
  maxSelectableTime.setHours(22, 0, 0, 0) // 10:00 PM

  // Get current time for today's minimum time
  const getCurrentMinTime = () => {
    if (isToday(baseDate)) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      // Round up to next 30-minute interval
      const roundedMinute = currentMinute <= 30 ? 30 : 0
      const roundedHour = currentMinute > 30 ? currentHour + 1 : currentHour

      const minTime = new Date()
      minTime.setHours(roundedHour, roundedMinute, 0, 0)

      return minTime > minSelectableTime ? minTime : minSelectableTime
    }
    return minSelectableTime
  }

  // Get minimum time for end time based on start time
  const getEndTimeMin = () => {
    if (startTime) {
      const minEndTime = new Date(startTime)
      minEndTime.setMinutes(minEndTime.getMinutes() + 30) // At least 30 minutes after start
      return minEndTime
    }
    return getCurrentMinTime()
  }

  // Reset end time if it's before the new start time
  useEffect(() => {
    if (startTime && endTime && endTime <= startTime) {
      setEndTime(null)
    }
  }, [startTime, endTime])

  const handleStartTimeChange = (time: Date | null) => {
    setStartTime(time)
  }

  const handleEndTimeChange = (time: Date | null) => {
    setEndTime(time)
  }
  const [loading, setLoading] = useState(false)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Fetch user's cases without lawyer
    const fetchUserCases = useCallback(async () => {
        if (!session?.accessToken || !session?.user?.role) return
        setCasesLoading(true)

        try {
            const role = session.user.role
            const endpoint = role === "lawyer"
            ? `${backendUrl}/api/v1/caseRequest/lawyer`
            : `${backendUrl}/api/v1/caseRequest/client`

            const response = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
            })

            if (response.ok) {
            const result = await response.json()
            if (result.success) {
                const filteredCases = (result.data as UserCase[]).filter(
                (c) => c.consultation_status === "active"
                )
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        const token = session?.accessToken
        const userRole = session?.user?.role
        const selectedCase = userCases.find((c) => c._id === selectedCaseId)

        if (!selectedCase) {
        throw new Error("No case selected")
        }

        const caseClientId = selectedCase.client_id
        const caseLawyerId = selectedCase.lawyer_id

        const dateOnly = new Date(formData.date)
        if (!startTime) throw new Error("Start time is required")

        const timestamp = new Date(
        dateOnly.getFullYear(),
        dateOnly.getMonth(),
        dateOnly.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
        )

        const appointmentData = {
        case_id: selectedCaseId,
        client_id: caseClientId,
        lawyer_id: caseLawyerId,
        timeStamp: timestamp.toISOString(),
        task: formData.task,
        location: formData.location,
        note: formData.note,
        permission: formData.permission,
        status: "confirmed",
        }

        const response = await fetch(`${backendUrl}/api/v1/appointment/create/${selectedCaseId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
        })

        if (!response.ok) {
        throw new Error("Failed to create appointment")
        }

        // Use caseClientId or caseLawyerId to refresh calendar properly
        const refreshId = userRole === "lawyer" ? caseLawyerId : caseClientId
        onSave(refreshId || "")
        onClose()
    } catch (error) {
        console.error("Error creating appointment:", error)
        alert("เกิดข้อผิดพลาดในการสร้างนัดหมาย")
    } finally {
        setLoading(false)
    }
    }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8"
    style={{ marginTop: 0 }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <h2 className="text-xl text-black font-semibold text-center mb-6">เพิ่มงานใหม่</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่องาน</label>
              <div className="bg-gray-100 rounded-lg p-3">
                <input
                  type="text"
                  name="task"
                  value={formData.task}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-none outline-none text-gray-700"
                  placeholder="ระบุชื่องาน"
                  required
                />
              </div>
            </div>
            {/* Case */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">เลือกคดีของคุณ</label>
            {casesLoading ? (
                <div className="text-gray-500 text-sm">กำลังโหลดคดี...</div>
            ) : userCases.length === 0 ? (
                <div className="text-sm text-gray-500">ไม่มีคดีที่ยังไม่มีทนาย</div>
            ) : (
                <Select
                options={caseOptions}
                value={caseOptions.find((option) => option.value === selectedCaseId)}
                onChange={(selected) => setSelectedCaseId(selected?.value || "")}
                placeholder="เลือกคดีที่ต้องการนัดหมาย"
                isSearchable
                className="text-sm text-black"
                classNamePrefix="react-select"
                />
            )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สถานที่</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border-2 border-blue-400 rounded-lg p-3 outline-none focus:border-blue-600"
                placeholder="ระบุสถานที่"
                required
              />
            </div>

            {/* Date Field */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">วันที่</label>
            <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]} // ✅ restrict to today or future
                className="w-full border border-gray-300 rounded-lg p-3 outline-none text-black focus:border-blue-600"
                required
            />
            </div>

            {/* Time Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">เวลาเริ่ม</label>
                      <div className="relative">
                        <div className="w-full border-2 border-blue-400 rounded-lg px-3 py-2 focus-within:border-blue-600 transition-colors">
                          <DatePicker
                            selected={startTime}
                            onChange={handleStartTimeChange}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="เวลา"
                            dateFormat="HH:mm"
                            placeholderText="เลือกเวลาเริ่ม"
                            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                            required
                            minTime={getCurrentMinTime()}
                            maxTime={maxSelectableTime}
                            timeFormat="HH:mm"
                          />
                        </div>
                      </div>
                    </div>
            
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">เวลาจบ</label>
                      <div className="relative">
                        <div className="w-full border-2 border-blue-400 rounded-lg px-3 py-2 focus-within:border-blue-600 transition-colors">
                          <DatePicker
                            selected={endTime}
                            onChange={handleEndTimeChange}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={30}
                            timeCaption="เวลา"
                            dateFormat="HH:mm"
                            placeholderText="เลือกเวลาจบ"
                            className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
                            required
                            minTime={getEndTimeMin()}
                            maxTime={maxSelectableTime}
                            timeFormat="HH:mm"
                            disabled={!startTime}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

            {/* Permission selection for lawyers */}
                {session?.user?.role === "lawyer" ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">สิทธิ์การนัดหมาย</label>
                    <select
                    name="permission"
                    value={formData.permission || "client"}
                    onChange={(e) =>
                        setFormData((prev) => ({ ...prev, permission: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none text-black focus:border-blue-600"
                    required
                    >
                    <option value="lawyer">เฉพาะทนายเห็น</option>
                    <option value="shared">ทั้งผู้ใช้และทนายเห็น</option>
                    </select>
                </div>
                ) : (
                <input
                    type="hidden"
                    name="permission"
                    value="client"
                    readOnly
                />
                )}

            {/* Note Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หมายเหตุ (ไม่บังคับ)</label>
              <div className="bg-gray-100 rounded-lg p-3">
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-transparent border-none outline-none text-gray-700 resize-none"
                  placeholder="ระบุหมายเหตุเพิ่มเติม"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-full font-medium hover:bg-slate-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-full font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
