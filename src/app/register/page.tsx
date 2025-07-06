'use client'

import { useState } from 'react'
// import { useRouter } from 'next/navigation'
import { FaArrowRight } from 'react-icons/fa'

export default function RegisterStep1() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  // const router = useRouter()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Send OTP to backend
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length !== 10) {
      console.error('Phone number must be 10 digits');
      return; // or set some error state to show user
    }

    // Format to xxx-xxx-xxxx
    const formattedPhone = digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');

    try {
      console.log('Sending OTP to:', formattedPhone);

      const res = await fetch(`${backendUrl}/api/v1/otpService/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tel: formattedPhone }), // send formatted phone as "tel"
      });

      if (!res.ok) {
        throw new Error('Failed to send OTP');
      }

      setOtpSent(true);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Verify OTP with backend
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length !== 10) {
      console.error('Phone number must be 10 digits');
      return; // or set some error state to show user
    }

    // Format to xxx-xxx-xxxx
    const formattedPhone = digitsOnly.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    try {
      console.log('Verifying OTP:', otp);

      const res = await fetch(`${backendUrl}/api/v1/otpService/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, tel : formattedPhone }), // sending phone and otp
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      // router.push(`/register/details?phone=${phone}`);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert(error);
      // Optional: set error state to show message to user
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={otpSent ? handleSubmit : handleSendOtp} className="space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center text-black">ลงทะเบียน</h2>

        <div className="relative">
          <input
            type="tel"
            placeholder="เบอร์โทรศัพท์"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
            disabled={otpSent}
          />
          {!otpSent && (
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-4 bg-gray-200 rounded-full text-black"
            >
              <FaArrowRight />
            </button>
          )}
        </div>

        {otpSent && (
          <>
            <input
              type="text"
              placeholder="รหัส OTP"
              value={otp}
              autoComplete="one-time-code"
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
              required
            />
            <button type="submit" className="w-full bg-[#353C63] text-white py-3 rounded-full hover:bg-gray-900">
              ต่อไป
            </button>
          </>
        )}
      </form>
    </div>
  )
}
