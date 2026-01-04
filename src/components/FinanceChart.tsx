"use client";

<<<<<<< HEAD
import Image from "next/image";
=======
>>>>>>> habyaad_dev
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  recentPayments: number;
}

const FinanceChart = () => {
  const [paymentData, setPaymentData] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.paymentSummary) {
          setPaymentData(data.paymentSummary);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const chartData = [
    {
      name: "Collected",
      amount: paymentData?.totalCollected || 0,
      fill: "#22c55e",
    },
    {
      name: "Pending",
      amount: paymentData?.totalPending || 0,
      fill: "#f59e0b",
    },
  ];

  const totalAmount = (paymentData?.totalCollected || 0) + (paymentData?.totalPending || 0);
  const collectionRate =
    totalAmount > 0
      ? Math.round((paymentData?.totalCollected || 0) / totalAmount * 100)
      : 0;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Payment Overview</h1>
          <p className="text-xs text-gray-500">Fee collection summary</p>
        </div>
        {paymentData?.recentPayments !== undefined && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {paymentData.recentPayments} recent payments
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(paymentData?.totalCollected || 0)}
                  </p>
                  <p className="text-xs text-gray-600">Collected</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-700">
                    {formatCurrency(paymentData?.totalPending || 0)}
                  </p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-700">
                    {collectionRate}%
                  </p>
                  <p className="text-xs text-gray-600">Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={80}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  formatter={(value: number) => [
                    new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                      minimumFractionDigits: 0,
                    }).format(value),
                    "Amount",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    padding: "12px"
                  }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar
                  dataKey="amount"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceChart;
