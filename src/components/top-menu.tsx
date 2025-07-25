"use client"

import Link from "next/link"
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react"
import { useSession, signOut } from "next-auth/react"
import { ChevronDown, User, LogOut, Settings } from "lucide-react" // เพิ่มไอคอนที่อาจใช้

export default function TopMenu() {
  const { data: session } = useSession()

  return (
    <div className="bg-white h-[80px] top-0 left-0 right-0 z-30 fixed border-b border-solid border-gray-100 flex items-center justify-between px-6 shadow-md">
      {/* Left Section - App Name */}
      <Link href="/admin/dashboard" className="flex items-center gap-2">
        <span className="text-xl font-bold text-gray-800">Admin Dashboard</span>
      </Link>

      {/* Right Section - User Menu */}
      <div className="flex items-center gap-6 h-full">
        {session ? (
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="flex items-center gap-2 focus:outline-none">
              <span className="text-gray-700 font-medium">สวัสดี, {session.user?.name?.split(" ")[0] || "ผู้ดูแลระบบ"}</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </MenuButton>
            <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-xl focus:outline-none z-50 p-1">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <div className="flex items-center gap-2">
                  {/* Minimalist Logo/Icon */}
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" /> {/* ใช้ไอคอน User แทนโลโก้ */}
                  </div>
                  <div className="text-sm font-medium text-gray-800">{session.user?.name || "ผู้ดูแลระบบ"}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">{session.user?.email || "admin@example.com"}</div>
              </div>
              <div className="py-1">
                <MenuItem>
                  {({ active }) => (
                    <Link
                      href="/admin/profile"
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                    >
                      <Settings className="h-4 w-4" />
                      โปรไฟล์
                    </Link>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={() => signOut({ callbackUrl: "/admin/login" })}
                      className={`flex items-center gap-2 w-full text-left px-4 py-2 text-sm rounded-md ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                    >
                      <LogOut className="h-4 w-4" />
                      ออกจากระบบ
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        ) : (
          <Link href="/admin/login" className="text-gray-700 font-medium hover:text-gray-900">
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </div>
  )
}
