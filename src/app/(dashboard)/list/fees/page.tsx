"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";

interface Fee {
  id: string | number;
  name: string;
  feeName?: string;
  amount: number;
  description?: string;
  dueDate?: string;
  term?: {
    id: string | number;
    name: string;
  };
  classLevel?: {
    id: string | number;
    name: string;
  };
  createdAt?: string;
}

interface Term {
  id: string | number;
  name: string;
  year?: string;
}

const columns = [
  { header: "Fee Name", accessor: "name" },
  { header: "Amount", accessor: "amount" },
  { header: "Term", accessor: "term", className: "hidden md:table-cell" },
  { header: "Class", accessor: "class", className: "hidden lg:table-cell" },
  { header: "Due Date", accessor: "dueDate", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const FeesPage = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<string>("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [feesRes, termsRes] = await Promise.all([
        fetch("/api/payment/fee", { credentials: "include" }),
        fetch("/api/terms", { credentials: "include" }),
      ]);

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

      if (termsRes.ok) {
        const termsData = await termsRes.json();
        setTerms(Array.isArray(termsData?.terms) ? termsData.terms : []);
      }
    } catch (err: any) {
      console.error("Error fetching fees:", err);
      setError(err.message || "Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeesByTerm = async (termId: string) => {
    if (!termId) {
      fetchInitialData();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/payment/fee?termId=${termId}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const feeList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setFees(feeList);
      }
    } catch (err: any) {
      console.error("Error fetching fees by term:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFee = async (feeId: string | number) => {
    if (!confirm("Are you sure you want to delete this fee?")) return;

    try {
      const res = await fetch(`/api/payment/fee/${feeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setFees(fees.filter((f) => f.id !== feeId));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete fee");
      }
    } catch (err: any) {
      console.error("Error deleting fee:", err);
      alert("Failed to delete fee");
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

  const renderRow = (item: Fee) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <div>
          <h3 className="font-semibold text-gray-800">
            {item.name || item.feeName}
          </h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          )}
        </div>
      </td>
      <td className="p-4">
        <span className="font-semibold text-green-600">
          {formatCurrency(item.amount)}
        </span>
      </td>
      <td className="hidden md:table-cell p-4 text-gray-600">
        {item.term?.name || "-"}
      </td>
      <td className="hidden lg:table-cell p-4 text-gray-600">
        {item.classLevel?.name || "All Classes"}
      </td>
      <td className="hidden lg:table-cell p-4 text-gray-600">
        {formatDate(item.dueDate)}
      </td>
      <td className="p-4">
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <FormModal table="fee" type="update" data={item} />
            <button
              onClick={() => handleDeleteFee(item.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple hover:bg-purple-200 transition"
            >
              <Image src="/delete.png" alt="Delete" width={16} height={16} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );

  // Calculate totals
  const totalFees = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

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
          <p className="text-lg font-semibold">Error loading fees</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchInitialData}
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
          <h1 className="text-lg font-semibold">Fee Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Define and manage school fees
          </p>
        </div>
        {role === "admin" && <FormModal table="fee" type="create" />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{fees.length}</p>
          <p className="text-sm text-gray-600">Total Fees</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalFees)}
          </p>
          <p className="text-sm text-gray-600">Combined Amount</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 text-center hidden md:block">
          <p className="text-3xl font-bold text-purple-600">{terms.length}</p>
          <p className="text-sm text-gray-600">Terms</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <select
            value={selectedTerm}
            onChange={(e) => {
              setSelectedTerm(e.target.value);
              fetchFeesByTerm(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Terms</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name} {term.year ? `(${term.year})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fees Table */}
      {fees.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <p className="font-medium">No fees found</p>
          <p className="text-sm mt-1">
            {selectedTerm
              ? "No fees defined for this term"
              : "Create your first fee to get started"}
          </p>
        </div>
      ) : (
        <>
          <Table columns={columns} renderRow={renderRow} data={fees} />
          <div className="mt-4 text-sm text-gray-500">
            Showing {fees.length} fee{fees.length !== 1 ? "s" : ""}
          </div>
        </>
      )}

      <Pagination />
    </div>
  );
};

export default FeesPage;
