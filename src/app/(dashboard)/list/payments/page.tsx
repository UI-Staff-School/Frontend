"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import { role } from "@/lib/data";

interface Payment {
  id: string | number;
  reference: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  paymentType?: string;
  paidAt?: string;
  createdAt?: string;
  student?: {
    id: string | number;
    admissionNo: string;
    firstName: string;
    lastName: string;
  };
  fee?: {
    id: string | number;
    name: string;
  };
}

const columns = [
  { header: "Student", accessor: "student" },
  { header: "Amount", accessor: "amount" },
  { header: "Status", accessor: "status" },
  { header: "Method", accessor: "method", className: "hidden md:table-cell" },
  { header: "Fee", accessor: "fee", className: "hidden lg:table-cell" },
  { header: "Date", accessor: "date", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Offline payment modal
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/payment", { credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        const paymentList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.payments)
          ? data.payments
          : [];
        setPayments(paymentList);
      } else {
        throw new Error("Failed to fetch payments");
      }
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Failed to load payments");
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
        return "bg-yellow-50 text-yellow-700";
      case "failed":
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const filteredPayments = statusFilter
    ? payments.filter(
        (p) => p.status?.toLowerCase() === statusFilter.toLowerCase()
      )
    : payments;

  const renderRow = (item: Payment) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {item.student?.firstName?.[0]}
              {item.student?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {item.student?.firstName} {item.student?.lastName}
            </h3>
            <p className="text-xs text-gray-500">{item.student?.admissionNo}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className="font-semibold text-green-600">
          {formatCurrency(item.amount)}
        </span>
      </td>
      <td className="p-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
            item.status
          )}`}
        >
          {item.status}
        </span>
      </td>
      <td className="hidden md:table-cell p-4 text-gray-600 capitalize">
        {item.paymentMethod || item.paymentType || "-"}
      </td>
      <td className="hidden lg:table-cell p-4 text-gray-600">
        {item.fee?.name || "-"}
      </td>
      <td className="hidden lg:table-cell p-4 text-gray-600">
        {formatDate(item.paidAt || item.createdAt)}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {item.student && (
            <Link
              href={`/list/payments/student/${item.student.id || item.student.admissionNo}`}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky hover:bg-lamaSkyLight transition"
              title="View student payments"
            >
              <Image src="/view.png" alt="View" width={16} height={16} />
            </Link>
          )}
        </div>
      </td>
    </tr>
  );

  // Calculate stats
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const successfulPayments = payments.filter(
    (p) => p.status?.toLowerCase() === "success" || p.status?.toLowerCase() === "completed"
  );
  const successfulAmount = successfulPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

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
          <p className="text-lg font-semibold">Error loading payments</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchPayments}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Payments</h1>
          <p className="text-xs text-gray-500 mt-1">
            View and manage all payment transactions
          </p>
        </div>
        {role === "admin" && (
          <button
            onClick={() => setShowOfflineModal(true)}
            className="mt-4 md:mt-0 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <span>+</span>
            Record Offline Payment
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{payments.length}</p>
          <p className="text-sm text-gray-600">Total Payments</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {successfulPayments.length}
          </p>
          <p className="text-sm text-gray-600">Successful</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-purple-600">
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-sm text-gray-600">Total Amount</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-emerald-600">
            {formatCurrency(successfulAmount)}
          </p>
          <p className="text-sm text-gray-600">Received</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <Link
            href="/list/fees"
            className="px-3 py-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Manage Fees →
          </Link>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <p className="font-medium">No payments found</p>
          <p className="text-sm mt-1">
            {statusFilter
              ? "No payments match your filter"
              : "Payments will appear here once recorded"}
          </p>
        </div>
      ) : (
        <>
          <Table columns={columns} renderRow={renderRow} data={filteredPayments} />
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredPayments.length} payment
            {filteredPayments.length !== 1 ? "s" : ""}
          </div>
        </>
      )}

      <Pagination />

      {/* Offline Payment Modal */}
      {showOfflineModal && (
        <OfflinePaymentModal
          onClose={() => setShowOfflineModal(false)}
          onSuccess={() => {
            setShowOfflineModal(false);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
};

// Offline Payment Modal Component
const OfflinePaymentModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [studentId, setStudentId] = useState("");
  const [feeId, setFeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fees, setFees] = useState<Array<{ id: string | number; name: string; amount: number }>>([]);

  useEffect(() => {
    // Fetch fees for dropdown
    fetch("/api/payment/fee", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const feeList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setFees(feeList);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !feeId || !amount) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId,
          feeId: Number(feeId),
          amount: Number(amount),
          paymentMethod,
          reference: reference || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to record payment");
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error recording payment:", err);
      setError(err.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Record Offline Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID / Admission No *
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g., STU001 or admission number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee *
            </label>
            <select
              value={feeId}
              onChange={(e) => {
                setFeeId(e.target.value);
                const selectedFee = fees.find((f) => String(f.id) === e.target.value);
                if (selectedFee) {
                  setAmount(String(selectedFee.amount));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select fee</option>
              {fees.map((fee) => (
                <option key={fee.id} value={fee.id}>
                  {fee.name} - ₦{fee.amount?.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (NGN) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount paid"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="pos">POS</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference (Optional)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Receipt/Transaction reference"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentsPage;
