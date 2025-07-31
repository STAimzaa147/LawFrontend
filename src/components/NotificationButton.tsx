"use client"

import { useEffect, useState } from "react"
import { Bell, X, Check } from "lucide-react"
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react"
import Link from "next/link"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Notification {
  _id: string
  message: string
  createdAt: string
  read: boolean
  link?: string
}

export default function NotificationButton() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  const router = useRouter()

  useEffect(() => {
    const fetchSessionAndNotifications = async () => {
      setLoading(true)
      try {
        const session = await getSession()
        if (!session?.accessToken) return
        setToken(session.accessToken)

        const res = await fetch(`${backendUrl}/api/v1/notification`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })

        const json = await res.json()
        if (json.success) {
          setNotifications(json.data)
        }
      } catch (error) {
        console.error("Failed to load notifications", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionAndNotifications()
  }, [backendUrl])

  const markAsRead = async (id: string) => {
    if (!token) return
    try {
      await fetch(`${backendUrl}/api/v1/notification/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    } catch (err) {
      console.error("Failed to mark as read", err)
    }
  }

  const markAllAsRead = async () => {
    if (!token) return
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) =>
            fetch(`${backendUrl}/api/v1/notification/${n._id}/read`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ),
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error("Failed to mark all as read", err)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!token) return
    try {
      await fetch(`${backendUrl}/api/v1/notification/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setNotifications((prev) => prev.filter((n) => n._id !== id))
    } catch (err) {
      console.error("Failed to delete notification", err)
    }
  }

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate)
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / 1000
    if (diff < 60) return "ไม่กี่วินาทีที่แล้ว"
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 rounded-full text-xs bg-red-500 text-white font-bold">
            {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
          </span>
        )}
      </MenuButton>

      <MenuItems className="absolute right-0 mt-2 w-64 sm:w-80 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50 max-h-96 overflow-hidden mr-0 sm:mr-0">
        <div className="py-1">
          <div className="px-3 sm:px-4 py-2 flex justify-between items-center text-sm font-semibold text-gray-800 border-b border-gray-200">
            <span>การแจ้งเตือน</span>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[#353C63] hover:text-blue-800 text-xs"
              >
                <Check className="w-3 h-3 sm:w-4 sm:h-4" /> อ่านทั้งหมด
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-3 sm:px-4 py-2 text-sm text-gray-500">กำลังโหลด...</div>
            ) : notifications.length === 0 ? (
              <div className="px-3 sm:px-4 py-2 text-sm text-gray-500">ไม่มีการแจ้งเตือนใหม่</div>
            ) : (
              notifications.map((notification) => (
                <MenuItem key={notification._id}>
                  {({ active }) => (
                    <div
                      className={`flex items-start justify-between px-3 sm:px-4 py-2 text-sm cursor-pointer ${
                        active ? "bg-gray-100" : ""
                      } ${notification.read ? "text-gray-500" : "text-gray-900 font-medium"}`}
                      onClick={async () => {
                        if (!notification.read) await markAsRead(notification._id)
                        if (notification.link) router.push(notification.link)
                      }}
                    >
                      <div className="flex-1 pr-2 min-w-0">
                        <p className="break-words text-xs sm:text-sm leading-4 sm:leading-5">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification._id)
                        }}
                        className="ml-2 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0"
                        aria-label="Delete notification"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  )}
                </MenuItem>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 mt-1 pt-1">
            <MenuItem>
              {({ active }) => (
                <Link
                  href="/notifications"
                  className={`block px-3 sm:px-4 py-2 text-sm text-center ${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  }`}
                >
                  ดูการแจ้งเตือนทั้งหมด
                </Link>
              )}
            </MenuItem>
          </div>
        </div>
      </MenuItems>
    </Menu>
  )
}
