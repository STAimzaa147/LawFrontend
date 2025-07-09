'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function PaymentSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`${backendUrl}/api/v1/payment/checkout/${id}/verify`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        })
        const data = await res.json()

        if (res.ok && data.success) {
          // Redirect back to the payment detail page after 1.5 seconds
          setTimeout(() => {
            router.push(`/payment/${id}`)
          }, 1500)
        } else {
          setError(data.message || 'Payment not completed')
          setLoading(false)
        }
      } catch {
        setError('Network error during payment verification')
        setLoading(false)
      }
    }

    verify()
  }, [id, router,session?.accessToken])

  if (loading) return <p>Verifying payment...</p>
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>

  return <p>Payment verified! Redirecting back to your payment details...</p>
}
