"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Gavel,
  Newspaper,
  BookText,
  MessageSquare,
  FileText,
  DollarSign,
  Flag,
} from "lucide-react"
import Image from "next/image"

export default function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "แดชบอร์ด",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "ผู้ใช้",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "ทนายความ",
      href: "/admin/lawyers",
      icon: <Gavel className="h-5 w-5" />,
    },
    {
      name: "คำขอคดี",
      href: "/admin/case-requests",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "ข่าวสาร",
      href: "/admin/news",
      icon: <Newspaper className="h-5 w-5" />,
    },
    {
      name: "บทความ",
      href: "/admin/articles",
      icon: <BookText className="h-5 w-5" />,
    },
    {
      name: "กระทู้",
      href: "/admin/forums",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "รายงาน",
      href: "/admin/reports",
      icon: <Flag className="h-5 w-5" />,
    },
    {
      name: "การชำระเงิน",
      href: "/admin/payments",
      icon: <DollarSign className="h-5 w-5" />,
    },
  ]

  return (
    <aside className="fixed left-0 top-0 z-20 h-screen w-64 bg-white text-white shadow-lg flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/img/Logo.jpg" alt="Admin Logo" width={40} height={40} className="rounded-full" />
          <span className="text-xl font-bold">แผงควบคุมผู้ดูแลระบบ</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-700 ${
                  pathname === item.href ? "bg-gray-700 text-white" : "text-slate-700 hover:text-white"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
