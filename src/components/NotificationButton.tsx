"use client"

import { Bell, X } from "lucide-react"
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react"
import Link from "next/link"

interface Notification {
  id: string
  message: string
  timestamp: string
  read: boolean
}

// Removed notificationCount from props as it's now derived internally
type NotificationButtonProps = Record<string, never>

export default function NotificationButton({}: NotificationButtonProps) {
  // Placeholder notifications for demonstration
  const notifications: Notification[] = [
    { id: "1", message: "คุณมีข้อความใหม่จากแชท", timestamp: "5 นาทีที่แล้ว", read: false },
    { id: "2", message: "กระทู้ 'วิธีการใช้งาน Next.js' มีการตอบกลับใหม่", timestamp: "1 ชั่วโมงที่แล้ว", read: false },
    { id: "3", message: "การชำระเงินของคุณสำเร็จแล้ว", timestamp: "เมื่อวานนี้", read: true },
    { id: "4", message: "มีข่าวใหม่: 'เทคโนโลยี AI ล่าสุด'", timestamp: "2 วันที่แล้ว", read: true },
  ]

  // Filter unread notifications for the badge count
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 w-10 h-10 flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs bg-red-500 text-white font-bold">
            {unreadNotificationsCount}
          </span>
        )}
      </MenuButton>

      <MenuItems className="absolute right-0 mt-2 w-80 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
        <div className="py-1">
          <div className="px-4 py-2 text-sm font-semibold text-gray-800 border-b border-gray-200">การแจ้งเตือน</div>
          {notifications.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">ไม่มีการแจ้งเตือนใหม่</div>
          ) : (
            notifications.map((notification) => (
              <MenuItem key={notification.id}>
                {({ active }) => (
                  <div
                    className={`flex items-start justify-between px-4 py-2 text-sm ${
                      active ? "bg-gray-100" : ""
                    } ${notification.read ? "text-gray-500" : "text-gray-900 font-medium"}`}
                  >
                    <div className="flex-1 pr-2">
                      <p>{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                    </div>
                    {/* Example action: Dismiss button */}
                    <button
                      className="ml-2 p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                      aria-label="Dismiss notification"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent closing the menu
                        console.log(`Dismiss notification ${notification.id}`)
                        // Add logic to dismiss/mark as read
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </MenuItem>
            ))
          )}
          <div className="border-t border-gray-200 mt-1 pt-1">
            <MenuItem>
              {({ active }) => (
                <Link
                  href="/notifications"
                  className={`block px-4 py-2 text-sm text-center ${
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
