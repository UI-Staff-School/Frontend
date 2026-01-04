"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Fee {
  id: string | number;
  name: string;
  feeName?: string;
  amount: number;
  description?: string;
  balance?: number;
  paidAmount?: number;
  term?: {
    id: string | number;
    name: string;
  };
}

interface Student {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  email?: string;
}

function PayFeeContent() {
  const searchParams = useSearchParams();
  const feeIdParam = searchParams.get("feeId");

  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFee, setSelectedFee] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (feeIdParam && fees.length > 0) {
      setSelectedFee(feeIdParam);
      const fee = fees.find((f) => String(f.id) === feeIdParam);
      if (fee) {
        const balance = fee.balance ?? fee.amount - (fee.paidAmount || 0);
        setAmount(balance > 0 ? balance : 0);
      }
    }
  }, [feeIdParam, fees]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentRes, feesRes] = await Promise.all([
        fetch("/api/student/me", { credentials: "include" }),
        fetch("/api/payment/my-fees", { credentials: "include" }),
      ]);

      if (!studentRes.ok) {
        const errorData = await studentRes.json();
        setError(errorData.error || "Failed to load profile");
        return;
      }

      const studentData = await studentRes.json();
      setStudent(studentData);

      if (feesRes.ok) {
        const feesData = await feesRes.json();
        const feeList = Array.isArray(feesData)
          ? feesData
          : Array.isArray(feesData?.data)
          ? feesData.data
          : Array.isArray(feesData?.fees)
          ? feesData.fees
          : [];
        // Filter fees with balance > 0
        const unpaidFees = feeList.filter((f: Fee) => {
          const balance = f.balance ?? f.amount - (f.paidAmount || 0);
          return balance > 0;
        });
        setFees(unpaidFees);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleFeeSelect = (feeId: string) => {
    setSelectedFee(feeId);
    const fee = fees.find((f) => String(f.id) === feeId);
    if (fee) {
      const balance = fee.balance ?? fee.amount - (fee.paidAmount || 0);
      setAmount(balance > 0 ? balance : 0);
    } else {
      setAmount(0);
    }
  };

  const handlePayment = async () => {
    if (!selectedFee || amount <= 0) {
      setError("Please select a fee and enter a valid amount");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const callbackUrl = `${window.location.origin}/student/fees/callback`;

      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          feeId: selectedFee,
          amount: amount,
          callbackUrl: callbackUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to initialize payment");
      }

      // Redirect to Paystack
      if (data.authorization_url || data.authorizationUrl || data.data?.authorization_url) {
        const paystackUrl = data.authorization_url || data.authorizationUrl || data.data?.authorization_url;
        window.location.href = paystackUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment");
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const selectedFeeData = fees.find((f) => String(f.id) === selectedFee);
  const maxAmount = selectedFeeData
    ? selectedFeeData.balance ?? selectedFeeData.amount - (selectedFeeData.paidAmount || 0)
    : 0;

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link
            href="/student/fees"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Fees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/student" className="hover:text-gray-700">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/student/fees" className="hover:text-gray-700">
          Fees
        </Link>
        <span>/</span>
        <span className="text-gray-800">Pay Online</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💳</span>
          <div>
            <h1 className="text-2xl font-bold">Pay Fees Online</h1>
            <p className="text-green-100">Secure payment via Paystack</p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white rounded-xl p-6">
        {fees.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              All Fees Paid!
            </h2>
            <p className="text-gray-500 mb-4">
              You have no outstanding fees to pay.
            </p>
            <Link
              href="/student/fees"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
            >
              <span>&#8592;</span> Back to Fees
            </Link>
          </div>
        ) : (
          <>
            {/* Student Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Paying as</p>
              <p className="font-medium text-gray-800">
                {student?.firstName} {student?.lastName}
              </p>
              <p className="text-sm text-gray-500">{student?.admissionNo}</p>
            </div>

            {/* Fee Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Fee to Pay
              </label>
              <select
                value={selectedFee}
                onChange={(e) => handleFeeSelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Choose a fee...</option>
                {fees.map((fee) => {
                  const balance = fee.balance ?? fee.amount - (fee.paidAmount || 0);
                  return (
                    <option key={fee.id} value={fee.id}>
                      {fee.name || fee.feeName} - Balance: {formatCurrency(balance)}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Selected Fee Details */}
            {selectedFeeData && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-3">
                  {selectedFeeData.name || selectedFeeData.feeName}
                </h3>
                {selectedFeeData.description && (
                  <p className="text-sm text-gray-500 mb-3">
                    {selectedFeeData.description}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-medium">{formatCurrency(selectedFeeData.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Paid</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(selectedFeeData.paidAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Balance</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency(maxAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Pay
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ₦
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAmount(Math.min(val, maxAmount));
                  }}
                  max={maxAmount}
                  min={100}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>
              {maxAmount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Maximum: {formatCurrency(maxAmount)}
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            {selectedFee && maxAmount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setAmount(maxAmount)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Pay Full ({formatCurrency(maxAmount)})
                </button>
                {maxAmount >= 10000 && (
                  <button
                    onClick={() => setAmount(Math.min(10000, maxAmount))}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    ₦10,000
                  </button>
                )}
                {maxAmount >= 20000 && (
                  <button
                    onClick={() => setAmount(Math.min(20000, maxAmount))}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    ₦20,000
                  </button>
                )}
                {maxAmount >= 50000 && (
                  <button
                    onClick={() => setAmount(Math.min(50000, maxAmount))}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    ₦50,000
                  </button>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={!selectedFee || amount <= 0 || processing}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span>💳</span>
                  Pay {amount > 0 ? formatCurrency(amount) : "Now"}
                </>
              )}
            </button>

            {/* Security Note */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="flex items-center justify-center gap-2">
                <span>🔒</span>
                Secured by Paystack
              </p>
              <p className="mt-1">
                Your payment is secure and encrypted
              </p>
            </div>
          </>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-6 text-center">
        <Link
          href="/student/fees"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span>&#8592;</span> Back to Fees
        </Link>
      </div>
    </div>
  );
}

export default function PayFeePage() {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      }
    >
      <PayFeeContent />
    </Suspense>
  );
}
