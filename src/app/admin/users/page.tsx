"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Input } from "@/components/ui/input" // Import Input for search

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "lawyer" | "admin"
  tel?: string
  location?: {
    district?: string
    province?: string
  }
  photo?: string
}

type SortColumn = keyof User | "location.province" | null
type SortDirection = "asc" | "desc"

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // State for search and sort
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<SortColumn>("_id") // Default sort by _id
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc") // Default sort new to old

  const fetchUsers = async () => {
    if (!session?.accessToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // FIX: Changed from apiFetch to native fetch for GET request
      const response = await fetch(`${backendUrl}/api/v1/admin/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      } else {
        toast({
          title: "ข้อผิดพลาด",
          description: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error fetching users:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers()
    }
  }, [session, toast]) // Added toast to dependency array

  const handleDeleteUser = async (userId: string) => {
    if (!session?.accessToken) return
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?")) return

    try {
      // FIX: Changed from apiFetch to native fetch for DELETE request
      const response = await fetch(`${backendUrl}/api/v1/admin/user/delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // No need to parse response if backend sends no content for success, but good practice to check
      // const data = await response.json(); 

      toast({
        title: "สำเร็จ",
        description: "ลบผู้ใช้เรียบร้อยแล้ว",
      })
      fetchUsers() // Refresh list
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถลบผู้ใช้ได้",
        variant: "destructive",
      })
    }
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc") // Default to ascending when changing column
    }
  }

  const sortedAndFilteredUsers = useMemo(() => {
    let currentUsers = [...users]

    // Filter by search term
    if (searchTerm) {
      currentUsers = currentUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.tel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.location?.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.location?.district?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort
    if (sortColumn) {
      currentUsers.sort((a, b) => {
        let valA: any
        let valB: any

        if (sortColumn === "location.province") {
          valA = a.location?.province || ""
          valB = b.location?.province || ""
        } else {
          valA = a[sortColumn as keyof User] || ""
          valB = b[sortColumn as keyof User] || ""
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }

        // Fallback for non-string types or _id (which can be compared directly as strings for chronological order)
        if (valA < valB) return sortDirection === "asc" ? -1 : 1
        if (valA > valB) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }
    return currentUsers
  }, [users, searchTerm, sortColumn, sortDirection])

  if (loading) {
    return <div className="text-center py-8">กำลังโหลดข้อมูลผู้ใช้...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">การจัดการผู้ใช้</h1>
      <Card>
        <CardHeader>
          <CardTitle>รายการผู้ใช้ทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="ค้นหาผู้ใช้ (ชื่อ, อีเมล, เบอร์โทร, จังหวัด, ตำบล)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {sortedAndFilteredUsers.length === 0 ? (
            <p className="text-center text-gray-500">ไม่พบข้อมูลผู้ใช้</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รูปโปรไฟล์</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        ชื่อ
                        {sortColumn === "name" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                      <div className="flex items-center">
                        อีเมล
                        {sortColumn === "email" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                      <div className="flex items-center">
                        บทบาท
                        {sortColumn === "role" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("tel")}>
                      <div className="flex items-center">
                        เบอร์โทรศัพท์
                        {sortColumn === "tel" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("location.province")}>
                      <div className="flex items-center">
                        จังหวัด
                        {sortColumn === "location.province" &&
                          (sortDirection === "asc" ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">การดำเนินการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          {user.photo ? (
                            <Image
                              src={user.photo || "/placeholder.svg"}
                              alt={user.name || "User"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-orange-400 flex items-center justify-center">
                              <span className="text-white text-lg font-medium">{user.name?.charAt(0).toUpperCase() || "U"}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.tel || "-"}</TableCell>
                      <TableCell>{user.location?.province || "-"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">เปิดเมนู</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/users/${user._id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> ดูข้อมูลและแก้ไข
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteUser(user._id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}