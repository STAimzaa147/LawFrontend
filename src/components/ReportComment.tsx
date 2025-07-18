"use client"

import { useState, useRef, useEffect } from "react"

interface ReportCommentProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (commentId: string, reason: string, details: string) => Promise<void>
  commentId: string
  commentContent: string
}

export default function ReportComment({ isOpen, onClose, onSubmit, commentId, commentContent }: ReportCommentProps) {
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("") // State for local error messages
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason) {
      setErrorMessage("กรุณาเลือกเหตุผลในการรายงานด้วยครับ") // Set local error message
      return
    }

    setIsSubmitting(true)
    setErrorMessage("") // Clear previous error messages

    try {
      await onSubmit(commentId, reason, details)
      onClose() // Close on success
      setReason("")
      setDetails("")
    } catch (error) {
      console.error("ส่งรายงานไม่สำเร็จ:", error)
      setErrorMessage("ไม่สามารถส่งรายงานได้ กรุณาลองใหม่อีกครั้ง") // Set local error message
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div ref={modalRef} className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-900">รายงานความคิดเห็น</h2>
          <p className="mt-1 text-sm text-gray-600">
            คุณกำลังรายงานความคิดเห็น: <span className="font-semibold line-clamp-1">{commentContent}</span>
            <br />
            กรุณาเลือกเหตุผลในการรายงานความคิดเห็นนี้
          </p>
        </div>

        {/* Body */}
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="reason" className="text-sm font-medium text-gray-700">
              เหตุผล
            </label>
            <div className="relative">
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  กรุณาเลือกเหตุผล
                </option>
                <option value="สแปม">สแปม</option>
                <option value="เนื้อหาไม่เหมาะสม">เนื้อหาไม่เหมาะสม</option>
                <option value="ละเมิดลิขสิทธิ์">ละเมิดลิขสิทธิ์</option>
                <option value="ข้อมูลเท็จ">ข้อมูลเท็จ</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="details" className="text-sm font-medium text-gray-700">
              รายละเอียดเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              id="details"
              placeholder="กรุณาใส่รายละเอียดเพิ่มเติมเกี่ยวกับปัญหา..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Error message display */}
        {errorMessage && (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {errorMessage}
          </p>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "กำลังส่ง..." : "ส่งรายงาน"}
          </button>
        </div>
      </div>
    </div>
  )
}
