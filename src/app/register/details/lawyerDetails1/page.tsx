'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export default function LawyerDetailsForm() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('user_id')

  console.log("Lawyer user ID:", userId)
  const router = useRouter()
  const [form, setForm] = useState({
    slogan: '',
    summary: '',
    licenseFile: null as File | null,
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, licenseFile: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Save form to localStorage
      localStorage.setItem('lawyerStep1', JSON.stringify({
        slogan: form.slogan,
        summary: form.summary,
      }))

      if (form.licenseFile) {
        const fileReader = new FileReader()
        fileReader.onload = () => {
          localStorage.setItem('licenseFile', fileReader.result as string)
          router.push(`/register/details/lawyerDetails2?user_id=${userId}`)
        }
        fileReader.readAsDataURL(form.licenseFile)
      } else {
        router.push(`/register/details/lawyerDetails2?user_id=${userId}`)
      }
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
        className="space-y-4 bg-white p-6 rounded-lg shadow-md w-full max-w-3xl"
      >
        <h2 className="text-xl font-semibold text-center text-black">ข้อมูลทนายเพิ่มเติม</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

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
        <div className='text-black'>
          บัตรทนายความ*
        </div>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="w-full p-3 border border-gray-300 rounded-full bg-gray-100 text-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#353C63] file:text-white hover:file:bg-[#2c3254]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#353C63] text-white py-3 rounded-full hover:bg-gray-900"
        >
          {loading ? 'กำลังโหลด...' : 'ถัดไป'}
        </button>
      </form>
    </div>
  )
}
