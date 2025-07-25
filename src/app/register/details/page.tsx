'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  id: string;
  name: string;
  email: string;
  // Add more fields as needed
}

export default function RegisterDetails() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawPhone = searchParams.get('phone') || ''
  const phone = rawPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') // formatted like OTP
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  console.log("Phone ",phone);

  const [form, setForm] = useState({
    name: '',
    lastname: '',
    thaiId: '',
    email: '',
    password: '',
    lineId: '',
    district: '',
    province: '',
    role: 'client',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const formatThaiId = (value: string) => {
    // Remove non-digits and limit to 13 digits max
    const digits = value.replace(/\D/g, '').slice(0, 13)

    const part1 = digits.slice(0, 1)
    const part2 = digits.slice(1, 5)
    const part3 = digits.slice(5, 10)
    const part4 = digits.slice(10, 12)
    const part5 = digits.slice(12, 13)

    let formatted = part1
    if (part2) formatted += '-' + part2
    if (part3) formatted += '-' + part3
    if (part4) formatted += '-' + part4
    if (part5) formatted += '-' + part5

    return formatted
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === 'thaiId') {
      const formatted = formatThaiId(value)
      setForm({ ...form, [name]: formatted })
    } else {
      setForm({ ...form, [name]: value })
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {

      const payload = {
        name: `${form.name} ${form.lastname}`, // combine if backend expects full name
        email: form.email,
        password: form.password,
        tel: phone,
        thai_id: form.thaiId,
        line_id: form.lineId,
        role: form.role,
        location: {
          district: form.district,   // or split properly if you add both fields
          province: form.province
        }
      }

      //register
      console.log(payload)
      const res = await fetch(`${backendUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.log(data);
      if (!res.ok) {
        setError(data.message || 'Registration failed')
        return
      } 
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        name: payload.name,
      }))

      const decoded: DecodedToken = jwtDecode<DecodedToken>(data.token);
      const userId = decoded.id

      if (form.role === 'lawyer') {
        router.push(`/register/details/lawyer-details?user_id=${userId}`)
      } else {
        router.push('/api/auth/signin')
      }
        router.refresh();
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.log(err);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-lg"
      >
        <h2 className="text-xl font-semibold text-center text-black">ลงทะเบียน</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex space-x-4">
          <input
            name="name"
            placeholder="ชื่อ*"
            value={form.name}
            onChange={handleChange}
            className="flex-1 p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
          />
          <input
            name="lastname"
            placeholder="นามสกุล*"
            value={form.lastname}
            onChange={handleChange}
            className="flex-1 p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
          />
        </div>

        <input
          name="thaiId"
          placeholder="เลขประจำตัวประชาชน"
          value={form.thaiId}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
        />
        <input
          name="email"
          type="email"
          placeholder="อีเมล*"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="รหัสผ่าน*"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
          required
        />
        <input
          name="lineId"
          placeholder="ไอดีไลน์"
          value={form.lineId}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
        />
        <div className="flex space-x-4">
          <input
            name="district"
            placeholder="อำเภอ*"
            value={form.district}
            onChange={handleChange}
            className="flex-1 p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
          />
          <input
            name="province"
            placeholder="จังหวัด*"
            value={form.province}
            onChange={handleChange}
            className="flex-1 p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: 'user' })}
            className={`flex-1 py-3 rounded-full border ${
              form.role === 'user'
                ? 'bg-[#353C63] text-white'
                : 'bg-gray-100 text-gray-600'
            } hover:bg-[#353C63]/90 transition hover:text-white`}
            disabled={form.role === 'user'}
          >
            ประชาชน
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: 'lawyer' })}
            className={`flex-1 py-3 rounded-full border ${
              form.role === 'lawyer'
                ? 'bg-[#353C63] text-white'
                : 'bg-gray-100 text-gray-600'
            } hover:bg-[#353C63]/90 transition hover:text-white`}
            disabled={form.role === 'lawyer'}
          >
            ทนาย
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#353C63] text-white py-3 rounded-full hover:bg-gray-900"
        >
          {loading ? 'Registering...' : 'ส่ง'}
        </button>
      </form>
    </div>
  )
}
