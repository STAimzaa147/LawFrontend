import type React from "react"
import AdminSidebar from "@/components/admin-sidebar"
import TopMenu from "@/components/top-menu"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        {" "}
        {/* Adjust margin-left to match sidebar width */}
        <TopMenu />
        <main className="p-8 pt-8">
          {" "}
          {/* Add padding-top to account for fixed top menu */}
          {children}
        </main>
      </div>
    </div>
  )
}
