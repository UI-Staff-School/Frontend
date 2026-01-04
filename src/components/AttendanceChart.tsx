"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

type ChartDatum = { name: string; present: number; absent: number };

const FALLBACK_DATA: ChartDatum[] = [
  { name: "Mon", present: 0, absent: 0 },
  { name: "Tue", present: 0, absent: 0 },
  { name: "Wed", present: 0, absent: 0 },
  { name: "Thu", present: 0, absent: 0 },
  { name: "Fri", present: 0, absent: 0 },
];

interface AttendanceSummary {
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
  weeklyData: Array<{
    day: string;
    present: number;
    absent: number;
  }>;
}

const AttendanceChart = () => {
  const [data, setData] = useState<ChartDatum[]>(FALLBACK_DATA);
  const [summary, setSummary] = useState<{ rate: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch("/api/analytics", { credentials: "include" });
        if (response.ok) {
          const analytics = await response.json();
          if (analytics.attendanceSummary) {
            const attendanceData: AttendanceSummary = analytics.attendanceSummary;

            // Map weekly data to chart format
            const chartData = attendanceData.weeklyData.map((item) => ({
              name: item.day,
              present: item.present,
              absent: item.absent,
            }));

            setData(chartData.length > 0 ? chartData : FALLBACK_DATA);
            setSummary({
              rate: attendanceData.attendanceRate,
              total: attendanceData.totalPresent + attendanceData.totalAbsent,
            });
          }
        }
      } catch (error) {
        console.error("[AttendanceChart] Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const hasData = data.some(d => d.present > 0 || d.absent > 0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Weekly Attendance</h1>
          <p className="text-xs text-gray-500">
            {loading ? "Loading attendance data..." :
             summary ? `${summary.rate}% attendance rate (${summary.total} records)` :
             "Present vs Absent overview"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-xs text-gray-600">Absent</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : !hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">No attendance data</p>
          <p className="text-xs mt-1">Data will appear once attendance is recorded</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={24} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  padding: "12px"
                }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar
                dataKey="present"
                name="Present"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="#f87171"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AttendanceChart;
