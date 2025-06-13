'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export default function LawyerDetailsStep2() {
  const router = useRouter()

  const searchParams = useSearchParams()
  const userId = searchParams.get('user_id')
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  console.log("Lawyer ID:", userId)

  const [form, setForm] = useState({
    lawfirmName: '',
    consultationFeeMin: '',
    consultationFeeMax: '',
    documentDelivery: false,
    documentDeliveryFee: '',
    expertise: [] as string[],
    workingDays: [] as string[],
    workingHours: {
      start: '',
      end: '',
    },
  })

  const expertiseOptions = [
    'คดีแพ่ง', 'คดีอาญา', 'คดีแรงงาน', 'คดีที่เกี่ยวกับที่อยู่อาศัย', 'คดีละเมิด / หมิ่นประมาท',
    'คดีครอบครัวและการรับอุปการะ', 'คดีธุรกิจและการขอสิทธิบัตร', 'คดีซื้อขายอสังหาริมทรัพย์',
    'คดีออนไลน์', 'คดีต่างด้าว / ตรวจคนเข้าเมือง', 'คดีที่ดินและสิทธิบรรพบุรุษ', 'คดีที่ดินและทรัพย์สิน'
  ]

  const daysOfWeek = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

  const handleCheckboxChange = (field: string, value: string) => {
    const list = form[field as keyof typeof form] as string[]
    setForm({
      ...form,
      [field]: list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const step1 = JSON.parse(localStorage.getItem('lawyerStep1') || '{}')
    const licenseBase64 = localStorage.getItem('licenseFile')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const body = {
      slogan: step1.slogan,
      summary: step1.summary,
      lawfirm_name: user.name || '', // If you have a field for this in step 1 or 2, insert it
      consultationRate: {
        min: parseInt(form.consultationFeeMin),
        max: parseInt(form.consultationFeeMax),
      },
      documentDeliveryRate: form.documentDelivery ? form.documentDeliveryFee : "0",
      civilCase_specialized: form.expertise, // assuming this maps to civil cases
      criminalCase_specialized: [], // if you have criminal case input, fill here
      verificationDocs: licenseBase64 || "",
    }

    const response = await fetch(`${backendUrl}/api/v1/lawyer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include token if needed for auth
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) throw new Error('Failed to add lawyer')

    alert('สร้างโปรไฟล์ทนายเรียบร้อยแล้ว!')
    router.push('/api/auth/signin')
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
  }
}


  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1c2340]">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-2xl shadow-md w-full max-w-3xl"
      >
        <h2 className="text-2xl font-semibold text-center text-black">
          เพิ่มข้อมูลส่วนตัวของคุณ <br /> เพื่อสร้างโปรไฟล์ทนายความ
        </h2>

        <div className="flex gap-4">
          <input
            name="consultationFeeMin"
            placeholder="ค่าปรึกษา (ต่ำสุด)*"
            value={form.consultationFeeMin}
            onChange={(e) => setForm({ ...form, consultationFeeMin: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
          />
          <input
            name="consultationFeeMax"
            placeholder="ค่าปรึกษา (สูงสุด)*"
            value={form.consultationFeeMax}
            onChange={(e) => setForm({ ...form, consultationFeeMax: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            required
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.documentDelivery}
              onChange={(e) => setForm({ ...form, documentDelivery: e.target.checked })}
              className="accent-[#353C63]"
            />
            <span className="text-black">รับส่งเอกสาร</span>
          </label>
          {form.documentDelivery && (
            <input
              name="documentDeliveryFee"
              placeholder="อัตรารับส่งเอกสาร"
              value={form.documentDeliveryFee}
              onChange={(e) => setForm({ ...form, documentDeliveryFee: e.target.value })}
              className="flex-1 p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
            />
          )}
        </div>

        <div>
          <label className="text-black font-medium mb-2 block">ความเชี่ยวชาญ</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {expertiseOptions.map((tag) => (
              <label key={tag} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.expertise.includes(tag)}
                  onChange={() => handleCheckboxChange('expertise', tag)}
                  className="accent-[#353C63]"
                />
                <span className="text-black">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-black font-medium mb-2 block">วันที่สะดวกให้บริการ</label>
          <div className="grid grid-cols-4 gap-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.workingDays.includes(day)}
                  onChange={() => handleCheckboxChange('workingDays', day)}
                  className="accent-[#353C63]"
                />
                <span className="text-black">{day}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-black font-medium mb-2 block">ช่วงเวลาทำงาน</label>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="เริ่มต้น (เช่น 09:00)"
              value={form.workingHours.start}
              onChange={(e) => setForm({ ...form, workingHours: { ...form.workingHours, start: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 text-black"
              
            />
            <input
              type="text"
              placeholder="สิ้นสุด (เช่น 17:00)"
              value={form.workingHours.end}
              onChange={(e) => setForm({ ...form, workingHours: { ...form.workingHours, end: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 text-black"
              
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#353C63] text-white py-3 rounded-full hover:bg-gray-900"
        >
          ส่ง
        </button>
      </form>
    </div>
  )
}
