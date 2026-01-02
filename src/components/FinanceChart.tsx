"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
      fill: "#4ade80",
    },
    {
      name: "Pending",
      amount: paymentData?.totalPending || 0,
      fill: "#fbbf24",
    },
  ];

  const totalAmount = (paymentData?.totalCollected || 0) + (paymentData?.totalPending || 0);
  const collectionRate =
    totalAmount > 0
      ? Math.round((paymentData?.totalCollected || 0) / totalAmount * 100)
      : 0;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Payment Overview</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[80%]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(paymentData?.totalCollected || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Collected</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(paymentData?.totalPending || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {collectionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Collection Rate</p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[60%]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="#4ade80"
                  radius={[8, 8, 0, 0]}
                  barSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Payments Badge */}
          {paymentData?.recentPayments !== undefined && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                {paymentData.recentPayments} payments in last 30 days
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FinanceChart;
