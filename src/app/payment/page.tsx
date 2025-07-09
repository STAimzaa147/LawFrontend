'use client'

import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Hiring = {
  client_id?: string
  lawyer_id?: string
}

type Payment = {
  _id: string
  amount: number
  status: string
  hiring_id?: Hiring
}

type ApiResponse =
  | { success: true; data: Payment[] }
  | { success: false; message: string; error?: string }

export default function PaymentsListPage() {
  const { data: session, status } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const fetchPayments = useCallback(async () => {
    if (!session?.accessToken) {
      // Access token not ready yet, skip fetch
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Fetching payments with token:', session.accessToken)

      const res = await fetch(`${backendUrl}/api/v1/payment`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        setError(errorData?.message || 'Failed to fetch payments')
        return
      }

      const data: ApiResponse = await res.json()

      if (data.success) {
        setPayments(data.data)
      } else {
        setError(data.message || 'Failed to fetch payments')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Network error fetching payments: ' + err.message)
      } else {
        setError('Network error fetching payments')
      }
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken, backendUrl])

  useEffect(() => {
    if (session?.accessToken) {
      fetchPayments()
    }
  }, [session?.accessToken, fetchPayments])

  if (status === 'loading' || loading) return <p>Loading payments...</p>
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>
  if (!payments.length) return <p>No payments found.</p>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">All Payments</h1>

      {payments.map((payment) => (
        <div
          key={payment._id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4 hover:shadow-md transition-shadow"
        >
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-medium text-gray-700">Payment ID:</span> {payment._id}
          </p>
          <p className="text-lg font-semibold text-gray-800 mb-2">
            Amount: ฿{payment.amount.toFixed(2)}
          </p>
          <p className="mb-4">
            <span className="text-black font-semibold">Status:</span>{' '}
            <span
              className={
                payment.status === 'paid'
                  ? 'text-green-600 font-semibold'
                  : payment.status === 'pending'
                  ? 'text-yellow-600 font-semibold'
                  : 'text-red-600 font-semibold'
              }
            >
              {payment.status}
            </span>
          </p>
          <Link
            href={`/payment/${payment._id}`}
            className="text-blue-600 hover:underline font-medium"
          >
            View Details →
          </Link>
        </div>
      ))}
    </div>
  )

}
