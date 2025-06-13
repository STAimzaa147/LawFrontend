'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordWithOtp() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState(1) // 1-send OTP, 2-verify OTP, 3-reset password
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const sendOtp = async () => {
    setError('')
    const digitsOnly = phone.replace(/\D/g, '')

    if (digitsOnly.length !== 10) {
      setError('เบอร์โทรต้องมี 10 หลัก')
      return
    }

    const formattedPhone = digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')

    try {
      const res = await fetch(`${backendUrl}/api/v1/otpService/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel: formattedPhone }),
      })

      if (!res.ok) throw new Error('ไม่สามารถส่ง OTP ได้')

      setStep(2)
      setMessage('ส่ง OTP สำเร็จ กรุณาตรวจสอบโทรศัพท์ของคุณ')
    } catch (e: unknown) {
  if (e instanceof Error) {
    setError(e.message);
  } else {
    setError(String(e)); // fallback for non-Error values
  }
}
  }

  const verifyOtp = async () => {
    setError('')
    const digitsOnly = phone.replace(/\D/g, '')

    if (digitsOnly.length !== 10) {
      setError('เบอร์โทรต้องมี 10 หลัก')
      return
    }

    const formattedPhone = digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')

    try {
      const res = await fetch(`${backendUrl}/api/v1/otpService/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel: formattedPhone, otp }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'ยืนยัน OTP ไม่สำเร็จ')
      }

      setStep(3)
      setMessage('ยืนยัน OTP สำเร็จ กรุณากรอกอีเมลและรหัสผ่านใหม่')
    } catch (e: unknown) {
  if (e instanceof Error) {
    setError(e.message);
  } else {
    setError(String(e)); // fallback for non-Error values
  }
}
  }

  const resetPassword = async () => {
    setError('')

    if (!email) {
      setError('กรุณากรอกอีเมล')
      return
    }

    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/resetPassword`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้')
      }

      setMessage('รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบ')
      setStep(1)
      setPhone('')
      setOtp('')
      setEmail('')
      setPassword('')
      router.push('/api/auth/signin')
    } catch (e: unknown) {
  if (e instanceof Error) {
    setError(e.message);
  } else {
    setError(String(e)); // fallback for non-Error values
  }
}
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (step === 1) sendOtp()
          else if (step === 2) verifyOtp()
          else if (step === 3) resetPassword()
        }}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-xl font-semibold text-center text-black">ลืมรหัสผ่าน</h2>
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {(step === 1 || step === 2) && (
          <input
            type="tel"
            placeholder="เบอร์โทรศัพท์"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
            disabled={step > 1}
          />
        )}

        {step === 2 && (
          <input
            type="text"
            placeholder="รหัส OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
          />
        )}

        {step === 3 && (
          <>
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
              placeholder="รหัสผ่านใหม่"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
              required
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-[#353C63] text-white py-3 rounded-full hover:bg-gray-900"
        >
          {step === 1 && 'ส่ง OTP'}
          {step === 2 && 'ยืนยัน OTP'}
          {step === 3 && 'รีเซ็ตรหัสผ่าน'}
        </button>
      </form>
    </div>
  )
}
