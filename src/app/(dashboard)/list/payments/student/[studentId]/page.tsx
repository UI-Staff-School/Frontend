"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Payment {
  id: string | number;
  reference: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt?: string;
  fee?: {
    id: string | number;
    name: string;
  };
}

interface FeeSummary {
  feeId: string | number;
  feeName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
}

interface Student {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  classArm?: {
    name: string;
    classLevel?: {
      name: string;
    };
  };
}

const StudentPaymentsPage = () => {
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<FeeSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch student info, payments, and summary
      const [studentRes, paymentsRes, summaryRes] = await Promise.all([
        fetch(`/api/student/${studentId}`, { credentials: "include" }),
        fetch(`/api/payment/student/${studentId}`, { credentials: "include" }),
        fetch(`/api/payment/summary/${studentId}`, { credentials: "include" }),
      ]);

      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudent(studentData);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        const paymentList = Array.isArray(paymentsData)
          ? paymentsData
          : Array.isArray(paymentsData?.data)
          ? paymentsData.data
          : [];
        setPayments(paymentList);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const summaryList = Array.isArray(summaryData)
          ? summaryData
          : Array.isArray(summaryData?.data)
          ? summaryData.data
          : summaryData?.fees
          ? summaryData.fees
          : null;
        setSummary(summaryList);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
      case "paid":
        return "bg-green-50 text-green-700";
      case "pending":
      case "partial":
        return "bg-yellow-50 text-yellow-700";
      case "failed":
      case "unpaid":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  // Calculate totals
  const totalPaid = payments
    .filter((p) => p.status?.toLowerCase() === "success" || p.status?.toLowerCase() === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalOutstanding = summary
    ? summary.reduce((sum, s) => sum + (s.balance || 0), 0)
    : 0;

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-semibold">Error loading data</p>
          <p className="text-sm">{error}</p>
          <Link
            href="/list/payments"
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Back to Payments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/list/payments" className="hover:text-gray-700">
          Payments
        </Link>
        <span>/</span>
        <span className="text-gray-800">
          {student?.firstName} {student?.lastName}
        </span>
      </div>

      {/* Student Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {student?.firstName?.[0]}
              {student?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {student?.firstName} {student?.lastName}
            </h1>
            <p className="text-green-100">{student?.admissionNo}</p>
            {student?.classArm && (
              <p className="text-green-100 text-sm">
                {student.classArm.classLevel?.name} {student.classArm.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalPaid)}
          </p>
          <p className="text-sm text-gray-500">Total Paid</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalOutstanding)}
          </p>
          <p className="text-sm text-gray-500">Outstanding Balance</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
          <p className="text-sm text-gray-500">Total Transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Summary */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Fee Summary
          </h2>
          {summary && summary.length > 0 ? (
            <div className="space-y-3">
              {summary.map((item, index) => (
                <div
                  key={item.feeId || index}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">{item.feeName}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Paid</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(item.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Balance</p>
                      <p
                        className={`font-medium ${
                          item.balance > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(item.balance)}
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                      style={{
                        width: `${Math.min(
                          (item.paidAmount / item.totalAmount) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No fee summary available</p>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Payment History
          </h2>
          {payments.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(payment.paidAt || payment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">
                        {payment.fee?.name || "Payment"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {payment.paymentMethod || "-"}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                  {payment.reference && (
                    <p className="text-xs text-gray-400 mt-2">
                      Ref: {payment.reference}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💳</span>
              </div>
              <p>No payment history</p>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Link
          href="/list/payments"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span>←</span> Back to Payments
        </Link>
      </div>
    </div>
  );
};

export default StudentPaymentsPage;
