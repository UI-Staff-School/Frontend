"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Fee {
  id: string | number;
  name: string;
  feeName?: string;
  amount: number;
  description?: string;
  dueDate?: string;
  balance?: number;
  paidAmount?: number;
  status?: string;
  term?: {
    id: string | number;
    name: string;
  };
}

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

interface Student {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  classArm?: {
    id: string | number;
    name: string;
    classLevel?: {
      id: string | number;
      name: string;
    };
  };
}

const StudentFeesPage = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"fees" | "payments">("fees");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentRes, feesRes, paymentsRes] = await Promise.all([
        fetch("/api/student/me", { credentials: "include" }),
        fetch("/api/payment/my-fees", { credentials: "include" }),
        fetch("/api/payment/my-payments", { credentials: "include" }),
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
        setFees(feeList);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        const paymentList = Array.isArray(paymentsData)
          ? paymentsData
          : Array.isArray(paymentsData?.data)
          ? paymentsData.data
          : Array.isArray(paymentsData?.payments)
          ? paymentsData.payments
          : [];
        setPayments(paymentList);
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

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "success":
      case "completed":
        return "bg-green-100 text-green-700";
      case "partial":
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "unpaid":
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Calculate totals
  const totalFees = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalBalance = fees.reduce(
    (sum, f) => sum + (f.balance ?? f.amount - (f.paidAmount || 0)),
    0
  );

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Fees
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link
            href="/student"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/student" className="hover:text-gray-700">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-800">Fees & Payments</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fees & Payments</h1>
            <p className="text-yellow-100 mt-1">
              {student?.firstName} {student?.lastName} - {student?.admissionNo}
            </p>
            {student?.classArm && (
              <p className="text-yellow-100 text-sm">
                {student.classArm.classLevel?.name} {student.classArm.name}
              </p>
            )}
          </div>
          {totalBalance > 0 && (
            <Link
              href="/student/fees/pay"
              className="flex items-center gap-2 px-5 py-3 bg-white text-yellow-600 rounded-lg font-semibold hover:bg-yellow-50 transition-all shadow-lg"
            >
              <span>💳</span>
              Pay Online
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Fees</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalFees)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Outstanding Balance</p>
          <p className={`text-2xl font-bold ${totalBalance > 0 ? "text-red-600" : "text-green-600"}`}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Payment Progress */}
      {totalFees > 0 && (
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Payment Progress
            </span>
            <span className="text-sm text-gray-500">
              {((totalPaid / totalFees) * 100).toFixed(1)}% Paid
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
              style={{ width: `${Math.min((totalPaid / totalFees) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("fees")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "fees"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            My Fees ({fees.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "payments"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Payment History ({payments.length})
          </button>
        </div>

        {/* Fees Tab */}
        {activeTab === "fees" && (
          <div>
            {fees.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <p className="font-medium">No Fees Found</p>
                <p className="text-sm mt-1">You have no fees assigned</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {fees.map((fee) => {
                  const paid = fee.paidAmount || 0;
                  const balance = fee.balance ?? fee.amount - paid;
                  const progress = (paid / fee.amount) * 100;

                  return (
                    <div key={fee.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {fee.name || fee.feeName}
                          </h3>
                          {fee.term && (
                            <p className="text-sm text-gray-500">
                              {fee.term.name}
                            </p>
                          )}
                          {fee.description && (
                            <p className="text-sm text-gray-400 mt-1">
                              {fee.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            fee.status || (balance <= 0 ? "paid" : balance < fee.amount ? "partial" : "unpaid")
                          )}`}
                        >
                          {fee.status || (balance <= 0 ? "Paid" : balance < fee.amount ? "Partial" : "Unpaid")}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium">
                            {formatCurrency(fee.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Paid</p>
                          <p className="font-medium text-green-600">
                            {formatCurrency(paid)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Balance</p>
                          <p
                            className={`font-medium ${
                              balance > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {formatCurrency(balance)}
                          </p>
                        </div>
                      </div>

                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {fee.dueDate && (
                          <p className="text-xs text-gray-400">
                            Due: {formatDate(fee.dueDate)}
                          </p>
                        )}
                        {balance > 0 && (
                          <Link
                            href={`/student/fees/pay?feeId=${fee.id}`}
                            className="ml-auto px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                          >
                            Pay Now
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div>
            {payments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💳</span>
                </div>
                <p className="font-medium">No Payments Found</p>
                <p className="text-sm mt-1">You have no payment history</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {payment.fee?.name || "Payment"}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {payment.paymentMethod || "N/A"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-gray-400">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href="/student"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span>&#8592;</span> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default StudentFeesPage;
