'use client'

import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function ConfirmSignOutPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      await signOut({ callbackUrl: '/' }) // ✅ Do not set redirect: false
    } catch (error) {
      console.error("Sign-out failed:", error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded-4xl shadow-md w-full max-w-lg text-center">
        <h2 className="text-xl font-semibold text-black mb-8">
          คุณแน่ใจว่าต้องการออกจากระบบ
        </h2>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-[#353C63] text-white rounded-full hover:bg-gray-800 transition"
          >
            ออกจากระบบ
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  )
}
