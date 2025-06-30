'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.ok) {
      router.push('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center text-black">เข้าสู่ระบบ</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
          required
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
          required
        />

        <div className="text-right text-sm">
          <Link href="/forgotPassword" className="text-blue-600 hover:underline">
            ลืมรหัสผ่าน?
          </Link>
        </div>

        <button type="submit" className="w-full bg-[#353C63] text-white py-3 rounded-full hover:bg-gray-900">
          เข้าสู่ระบบ
        </button>
        <div className="text-center text-sm text-gray-500 my-2">หรือเข้าสู่ระบบด้วย</div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full bg-gray-100 text-black py-2 rounded-full hover:bg-gray-300 flex items-center justify-center gap-2"
        >
          <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" unoptimized width={20} height={20} />
          <span>Sign in with Google</span>
        </button>

        {/*<button
          type="button"
          onClick={() => signIn('facebook', { callbackUrl: '/' })}
          className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700"
        >
          Sign in with Facebook
        </button>*/}
      </form>
    </div>
  )
}
