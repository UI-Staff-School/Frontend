"use client";

import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

interface GenderData {
  male: number;
  female: number;
  total: number;
}

const CountChart = () => {
  const [genderData, setGenderData] = useState<GenderData>({
    male: 0,
    female: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.studentsByGender) {
          setGenderData(data.studentsByGender);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const malePercentage =
    genderData.total > 0
      ? Math.round((genderData.male / genderData.total) * 100)
      : 0;
  const femalePercentage =
    genderData.total > 0
      ? Math.round((genderData.female / genderData.total) * 100)
      : 0;

  const chartData = [
    {
      name: "Total",
      count: genderData.total,
      fill: "#f3f4f6",
    },
    {
      name: "Girls",
      count: genderData.female,
      fill: "#f472b6",
    },
    {
      name: "Boys",
      count: genderData.male,
      fill: "#22c55e",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* TITLE */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Student Gender Distribution
        </h2>
        <p className="text-xs text-gray-500 mt-1">Breakdown by gender</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* CHART */}
          <div className="relative flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="100%"
                barSize={28}
                data={chartData}
              >
                <RadialBar background dataKey="count" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {genderData.total}
              </p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {genderData.male.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Boys ({malePercentage}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-pink-400 rounded-full" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {genderData.female.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Girls ({femalePercentage}%)
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountChart;
