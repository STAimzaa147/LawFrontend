"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LawyerDetailsForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("user_id")
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  console.log("Lawyer user ID:", userId)

  const [form, setForm] = useState({
    slogan: "",
    summary: "",
    licenseFile: null as File | null,
    lawfirmName: "", // Added as an input field
    consultationFeeMin: "",
    consultationFeeMax: "",
    documentDelivery: false,
    documentDeliveryFee: "",
    expertise: [] as string[],
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const expertiseOptions = [
    "คดีแพ่ง",
    "คดีอาญา",
    "คดีแรงงาน",
    "คดีที่เกี่ยวกับที่อยู่อาศัย",
    "คดีละเมิด / หมิ่นประมาท",
    "คดีครอบครัวและการรับอุปการะ",
    "คดีธุรกิจและการขอสิทธิบัตร",
    "คดีซื้อขายอสังหาริมทรัพย์",
    "คดีออนไลน์",
    "คดีต่างด้าว / ตรวจคนเข้าเมือง",
    "คดีที่ดินและสิทธิบรรพบุรุษ",
    "คดีที่ดินและทรัพย์สิน",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, licenseFile: e.target.files[0] })
    }
  }

  const handleCheckboxChange = (field: string, value: string) => {
    const list = form[field as keyof typeof form] as string[]
    setForm({
      ...form,
      [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let licenseBase64 = ""
      if (form.licenseFile) {
        licenseBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(form.licenseFile as Blob)
        })
      }

      const token = localStorage.getItem("token")

      const body = {
        slogan: form.slogan,
        summary: form.summary,
        lawfirm_name: form.lawfirmName,
        consultationRate: {
          min: Number.parseInt(form.consultationFeeMin),
          max: Number.parseInt(form.consultationFeeMax),
        },
        documentDeliveryRate: form.documentDelivery ? form.documentDeliveryFee : "0",
        civilCase_specialized: form.expertise,
        criminalCase_specialized: [], // As per original code, no specific input for this
        verificationDocs: licenseBase64,
      }

      const response = await fetch(`${backendUrl}/api/v1/lawyer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add lawyer")
      }

      alert("สร้างโปรไฟล์ทนายเรียบร้อยแล้ว!")
      router.push('/api/auth/signin')
    } catch (err: unknown) {
    if (err instanceof Error) {
        setError(err.message);
        console.error(err);
    } else {
        setError("Something went wrong. Please try again.");
        console.error("Unknown error", err);
    }
    alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
    setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-dark py-6">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-md w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-center text-black">
          เพิ่มข้อมูลส่วนตัวของคุณ <br /> เพื่อสร้างโปรไฟล์ทนายความ
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Fields from lawyerDetails1 */}
        <input
          name="slogan"
          placeholder="สโลแกนของคุณ*"
          value={form.slogan}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
          required
        />
        <textarea
          name="summary"
          placeholder="สรุปเกี่ยวกับตัวคุณ*"
          value={form.summary}
          onChange={handleChange}
          rows={12}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-gray-100 placeholder-gray-500 text-black resize-none"
          required
        />
        <div className="text-black">บัตรทนายความ*</div>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 text-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2c3254] file:text-white hover:file:bg-[#2c3254]/80"
        />

        {/* New field for Law Firm Name */}
        <input
          name="lawfirmName"
          placeholder="ชื่อสำนักงานกฎหมาย*"
          value={form.lawfirmName}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 placeholder-gray-500 text-black"
          required
        />

        {/* Fields from lawyerDetails2 */}
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
              className="accent-accent-blue"
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
                  onChange={() => handleCheckboxChange("expertise", tag)}
                  className="accent-accent-blue"
                />
                <span className="text-black">{tag}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2c3254] text-white py-3 rounded-full hover:bg-[#2c3254]/80 hover:text-white"
        >
          {loading ? "กำลังโหลด..." : "ส่ง"}
        </button>
      </form>
    </div>
  )
}
