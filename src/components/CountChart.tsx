"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";

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
      fill: "white",
    },
    {
      name: "Girls",
      count: genderData.female,
      fill: "#FAE27C",
    },
    {
      name: "Boys",
      count: genderData.male,
      fill: "#C3EBFA",
    },
  ];

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Students</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[75%]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* CHART */}
          <div className="relative w-full h-[75%]">
            <ResponsiveContainer>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="100%"
                barSize={32}
                data={chartData}
              >
                <RadialBar background dataKey="count" />
              </RadialBarChart>
            </ResponsiveContainer>
            <Image
              src="/maleFemale.png"
              alt=""
              width={50}
              height={50}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          {/* BOTTOM */}
          <div className="flex justify-center gap-16">
            <div className="flex flex-col gap-1">
              <div className="w-5 h-5 bg-lamaSky rounded-full" />
              <h1 className="font-bold">{genderData.male.toLocaleString()}</h1>
              <h2 className="text-xs text-gray-300">Boys ({malePercentage}%)</h2>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-5 h-5 bg-lamaYellow rounded-full" />
              <h1 className="font-bold">{genderData.female.toLocaleString()}</h1>
              <h2 className="text-xs text-gray-300">Girls ({femalePercentage}%)</h2>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountChart;
