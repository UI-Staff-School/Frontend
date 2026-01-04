"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaymentResult {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    status: string;
    paidAt?: string;
    feeName?: string;
  };
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setError("No payment reference found");
      return;
    }

    verifyPayment(reference);
  }, [reference]);

  const verifyPayment = async (ref: string) => {
    try {
      const res = await fetch(`/api/payment/verify/${ref}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok && (data.status === "success" || data.data?.status === "success")) {
        setStatus("success");
        setResult({
          success: true,
          message: data.message || "Payment verified successfully",
          data: {
            reference: ref,
            amount: data.amount || data.data?.amount || 0,
            status: "success",
            paidAt: data.paidAt || data.data?.paid_at || new Date().toISOString(),
            feeName: data.feeName || data.data?.metadata?.feeName,
          },
        });
      } else {
        setStatus("failed");
        setError(data.error || data.message || "Payment verification failed");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setStatus("failed");
      setError(err.message || "Failed to verify payment");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (status === "loading") {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Verifying Payment...
          </h2>
          <p className="text-gray-500">Please wait while we confirm your payment</p>
          <p className="text-sm text-gray-400 mt-4">Reference: {reference}</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-500 mb-6">{error}</p>

          {reference && (
            <p className="text-sm text-gray-400 mb-6">Reference: {reference}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/student/fees/pay"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              Try Again
            </Link>
            <Link
              href="/student/fees"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Back to Fees
            </Link>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> If money was deducted from your account, it will be
              refunded automatically within 24-48 hours. Contact support if you need
              assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="bg-white rounded-xl p-8 text-center">
        {/* Success Animation */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-6">Your payment has been processed successfully</p>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <div className="space-y-4">
            {result?.data?.feeName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Fee</span>
                <span className="font-medium text-gray-800">{result.data.feeName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-600 text-lg">
                {formatCurrency(result?.data?.amount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Reference</span>
              <span className="font-mono text-sm text-gray-700">
                {result?.data?.reference}
              </span>
            </div>
            {result?.data?.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-gray-700">{formatDate(result.data.paidAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/student/fees"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            View My Fees
          </Link>
          <Link
            href="/student"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Receipt Note */}
        <p className="mt-6 text-sm text-gray-400">
          A receipt has been sent to your registered email address
        </p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="p-4 max-w-lg mx-auto">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
