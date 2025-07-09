"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Hiring = {
  client_id?: string;
  lawyer_id?: string;
  _id?: string;
};

type Payment = {
  _id: string;
  amount: number;
  status: string;
  hiring_id?: Hiring;
  stripeSession_id?: string;
};

type ApiResponse =
  | { success: true; data: Payment }
  | { success: false; message: string; error?: string };

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PaymentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    if (!session?.accessToken) return; // Wait for session token

    async function fetchPayment() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${backendUrl}/api/v1/payment/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        const data: ApiResponse = await res.json();

        if (data.success) {
          setPayment(data.data);
        } else {
          setError(data.message || "Failed to load payment");
        }
      } catch {
        setError("Failed to load payment");
      } finally {
        setLoading(false);
      }
    }

    fetchPayment();
  }, [session?.accessToken, id]);

  const handleCheckout = async () => {
    if (!payment || !session?.accessToken) return;

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch(
        `${backendUrl}/api/v1/payment/checkout/${payment._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.message || "Failed to start checkout");
      }
    } catch {
      setCheckoutError("Network error during checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <p>Loading payment details...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!payment) return <p>No payment found.</p>;

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="max-w-xl w-full p-6 bg-white rounded-lg shadow-md">
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
          <h1 className="text-3xl text-black font-bold mb-6 text-center">
            Payment Detail
          </h1>

          <div className="mb-6 space-y-3">
            <p className="truncate">
              <span className="font-semibold text-gray-800">Payment ID:</span>{" "}
              <span className="text-gray-700">{payment._id}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-800">Amount:</span>{" "}
              <span className="text-gray-700">
                ฿{payment.amount.toFixed(2)}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">Status:</span>
              <span
                className={`font-semibold ${
                  payment.status === "paid"
                    ? "text-green-700 bg-green-100 px-2 rounded"
                    : payment.status === "pending"
                      ? "text-yellow-700 bg-yellow-100 px-2 rounded"
                      : "text-red-700 bg-red-100 px-2 rounded"
                }`}
                style={{ minWidth: "60px", textAlign: "center" }}
              >
                {payment.status}
              </span>
            </p>
            <p>
              <span className="font-semibold text-gray-800">Hiring ID:</span>{" "}
              <span className="text-gray-700">
                {payment.hiring_id?._id || "N/A"}
              </span>
            </p>

            <p className="truncate"></p>
          </div>

          {session?.user?.role !== "lawyer" && (
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || payment.status === "paid"}
              className={`w-full py-3 rounded-md text-white font-semibold transition-colors
                ${
                  checkoutLoading || payment.status === "paid"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {checkoutLoading
                ? "Starting checkout..."
                : payment.status === "paid"
                  ? "Already Paid"
                  : "Pay Now"}
            </button>
          )}


          {checkoutError && (
            <p className="mt-3 text-center text-red-600 font-semibold">
              {checkoutError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
