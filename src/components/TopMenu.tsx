"use client"

import { useState } from "react"
import Image from "next/image"
import TopMenuItem from "./TopMenuItem"
import Link from "next/link"
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react"
import { useSession } from "next-auth/react"
import NotificationButton from "./NotificationButton"
import { MenuIcon, XIcon } from "lucide-react"

export default function TopMenu() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-white h-16 sm:h-20 fixed top-0 left-0 right-0 z-30 border-b border-gray-100 flex items-center justify-between px-3 sm:px-4 md:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/">
          <Image
            src="/img/Logo.jpg"
            className="object-contain"
            alt="logo"
            width={50}
            height={16}
            sizes="(max-width: 640px) 40px, 60px"
            unoptimized
          />
        </Link>

        {/* Desktop menu */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
          <TopMenuItem title="กระทู้" pageRef="/forum" />
          <TopMenuItem title="ข่าว" pageRef="/news" />
          <TopMenuItem title="บทความ" pageRef="/articles" />
          {session && (
            <>
              <TopMenuItem title="ปฏิทิน" pageRef="/schedule" />
              <TopMenuItem title="แชท" pageRef="/chat" />
              <TopMenuItem title="คดี" pageRef="/case" />
            </>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {session ? (
          <>
            {/* Notification Button - Same for mobile and desktop */}
            <NotificationButton />

            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="flex items-center gap-1 sm:gap-2 focus:outline-none">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                  <Image
                    src={session.user?.image || "/img/default-avatar.jpg"}
                    alt="avatar"
                    fill
                    className="object-cover rounded-full"
                    unoptimized
                  />
                </div>
                <span className="hidden md:inline text-gray-700 font-medium text-sm lg:text-base">
                  สวัสดี, {session.user?.name?.split(" ")[0] || "ผู้ใช้"}
                </span>
              </MenuButton>
              <MenuItems className="absolute right-0 mt-2 w-44 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none z-50">
                <div className="py-1">
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/users/profile"
                        className={`block px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                      >
                        โปรไฟล์
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/payment"
                        className={`block px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                      >
                        การชำระเงิน
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/auth/signout"
                        className={`block px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}`}
                      >
                        ออกจากระบบ
                      </Link>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          </>
        ) : (
          <div className="hidden lg:flex gap-2 sm:gap-4">
            <TopMenuItem title="เข้าสู่ระบบ" pageRef="/api/auth/signin" />
            <TopMenuItem title="ลงทะเบียน" pageRef="/register" />
          </div>
        )}

        {/* Mobile hamburger menu */}
        <div className="relative lg:hidden flex items-center">
          <button
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle mobile menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <MenuIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>

          {/* Mobile menu dropdown */}
          <div
            className={`absolute top-full mt-2 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col p-3 space-y-2
              transition-all duration-200 ease-in-out
              ${mobileMenuOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 -translate-y-2 invisible"}
            `}
            onClick={() => setMobileMenuOpen(false)}
          >
            <TopMenuItem title="กระทู้" pageRef="/forum" />
            <TopMenuItem title="ข่าว" pageRef="/news" />
            <TopMenuItem title="บทความ" pageRef="/articles" />
            {session ? (
              <>
                <TopMenuItem title="ปฏิทิน" pageRef="/schedule" />
                <TopMenuItem title="แชท" pageRef="/chat" />
                <TopMenuItem title="คดี" pageRef="/case" />
                <TopMenuItem title="ออกจากระบบ" pageRef="/auth/signout" />
              </>
            ) : (
              <>
                <TopMenuItem title="เข้าสู่ระบบ" pageRef="/api/auth/signin" />
                <TopMenuItem title="ลงทะเบียน" pageRef="/register" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
