"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import AddAppointmentModal from "@/components/AddAppointmentModal"

const thaiDays = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"]
const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
]

// Add these interfaces for type safety
interface Appointment {
  _id: string
  hiringId?: string
  client_id: string
  lawyer_id: string
  timeStamp: string
  task: string
  note?: string
  location: string
  status?: "confirmed" | "cancelled" | "completed"
  permission?: "shared" | "lawyer" | "client"
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  data: Appointment[]
}

export default function SchedulePage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState(today.getDate())
  const [events, setEvents] = useState<{ [key: number]: Appointment[] }>({})
  const [selectedDayEvents, setSelectedDayEvents] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const [showModal, setShowModal] = useState(false)

  const fetchAppointments = useCallback(async () => {
    try {
        setLoading(true);
        const token = session?.accessToken;

        const response = await fetch(`${backendUrl}/api/v1/appointment/`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        });

        if (!response.ok) {
        throw new Error("Failed to fetch appointments");
        }

        const result: ApiResponse = await response.json();

        const eventsByDate: { [key: number]: Appointment[] } = {};
        result.data.forEach((appointment) => {
        const appointmentDate = new Date(appointment.timeStamp);
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        if (appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear) {
            const day = appointmentDate.getDate();
            if (!eventsByDate[day]) {
            eventsByDate[day] = [];
            }
            eventsByDate[day].push(appointment);
        }
        });

        setEvents(eventsByDate);

        if (eventsByDate[selectedDate]) {
        setSelectedDayEvents(eventsByDate[selectedDate]);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
        setLoading(false);
    }
    }, [backendUrl, currentDate, selectedDate, session?.accessToken]);

    useEffect(() => {
    const userId = session?.user.id;
    if (userId != null) {
        fetchAppointments();
    }
    }, [fetchAppointments, session?.user.id]);

  // Update selected day events when date changes
  useEffect(() => {
    const dayEvents = events[selectedDate] || []
    setSelectedDayEvents(dayEvents)
  }, [selectedDate, events])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const thaiYear = year + 543

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Create calendar grid
  const calendarDays = []

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday,
      hasEvents: events[day],
    })
  }

  // Next month days to fill the grid
  const remainingCells = 42 - calendarDays.length
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
    })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-slate-700 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    className="p-2 hover:bg-slate-600 rounded-md transition-colors"
                    onClick={() => navigateMonth("prev")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="p-2 hover:bg-slate-600 rounded-md transition-colors"
                    onClick={() => navigateMonth("next")}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <h1 className="text-lg font-semibold">
                    {thaiMonths[month]} {thaiYear}
                  </h1>
                </div>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 bg-slate-600 text-white">
              {thaiDays.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium border-r border-slate-500 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] border-r border-b border-gray-300 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !date.isCurrentMonth ? "text-gray-400 bg-gray-50" : ""
                  } ${selectedDate === date.day && date.isCurrentMonth ? "bg-blue-100 text-blue-800 font-semibold" : ""}
                    ${date.isToday ? "ring-2 ring-blue-300" : ""}`}
                  onClick={() => date.isCurrentMonth && setSelectedDate(date.day)}
                >
                  <div className={`text-sm font-medium mb-1 ${date.isToday ? "text-blue-600" : ""}`}>{date.day}</div>
                  {date.hasEvents && (
                    <div className="space-y-1">
                      {date.hasEvents.map((appointment, eventIndex) => (
                        <div
                          key={appointment._id || eventIndex}
                          className={`text-xs px-1 py-0.5 rounded ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : appointment.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {new Date(appointment.timeStamp).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          {appointment.task}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Day Events */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-sm text-black font-semibold mb-4">
              {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toLocaleDateString("th-TH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                calendar: "buddhist",
              })}
            </h2>

            {loading ? (
              <div className="text-center py-4 text-gray-500">กำลังโหลด...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">เกิดข้อผิดพลาด: {error}</div>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map((appointment, index) => (
                  <div key={appointment._id || index} className="bg-gray-100 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(appointment.timeStamp).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-sm text-black font-medium">{appointment.task}</div>
                    <div className="text-xs text-gray-600 mt-1">สถานที่: {appointment.location}</div>
                    {appointment.note && <div className="text-xs text-gray-600 mt-1">หมายเหตุ: {appointment.note}</div>}
                    <div
                      className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : appointment.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appointment.status === "confirmed"
                        ? "ยืนยันแล้ว"
                        : appointment.status === "cancelled"
                          ? "ยกเลิก"
                          : appointment.status === "completed"
                            ? "เสร็จสิ้น"
                            : appointment.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Event Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors p-4 rounded-lg flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มงานใหม่
          </button>

          {/* Add New Appointment Modal */}
          {showModal && <AddAppointmentModal onClose={() => setShowModal(false)} onSave={fetchAppointments} />}
        </div>
      </div>
    </div>
  )
}
