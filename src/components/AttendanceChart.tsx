"use client";
import Image from "next/image";
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
import { useEffect, useMemo, useState } from "react";

type ChartDatum = { name: string; present: number; absent: number };

const FALLBACK_DATA: ChartDatum[] = [
  { name: "Mon", present: 60, absent: 40 },
  { name: "Tue", present: 70, absent: 60 },
  { name: "Wed", present: 90, absent: 75 },
  { name: "Thu", present: 90, absent: 75 },
  { name: "Fri", present: 65, absent: 55 },
];

const DEFAULT_STUDENT_ID =
  process.env.NEXT_PUBLIC_ATTENDANCE_SUMMARY_STUDENT_ID;
const DEFAULT_TERM_ID = process.env.NEXT_PUBLIC_ATTENDANCE_SUMMARY_TERM_ID;

const normalizeSummary = (payload: any): ChartDatum[] => {
  if (!payload) return [];

  if (Array.isArray(payload?.dailyBreakdown)) {
    return payload.dailyBreakdown.map((entry: any, idx: number) => ({
      name:
        entry.day ||
        entry.label ||
        `Day ${idx + 1}`,
      present:
        entry.present ??
        entry.presentCount ??
        entry.present_percentage ??
        0,
      absent:
        entry.absent ??
        entry.absentCount ??
        entry.absent_percentage ??
        0,
    }));
  }

  if (Array.isArray(payload?.data)) {
    const buckets = new Map<string, ChartDatum>();
    payload.data.forEach((record: any) => {
      const rawDate =
        record.date ||
        record.attendanceDate ||
        record.createdAt ||
        record.day;
      const date = rawDate ? new Date(rawDate) : null;
      const name = date
        ? date.toLocaleDateString("en-US", { weekday: "short" })
        : record.day || "Day";
      const key = `${name}-${date?.toISOString() || ""}`;
      const bucket = buckets.get(key) || { name, present: 0, absent: 0 };
      const status =
        record.status ||
        record.attendanceStatus ||
        (record.isPresent ? "Present" : "Absent");
      if (String(status).toLowerCase() === "present" || record.isPresent) {
        bucket.present += 1;
      } else {
        bucket.absent += 1;
      }
      buckets.set(key, bucket);
    });
    return Array.from(buckets.values());
  }

  if (
    typeof payload.totalPresent === "number" ||
    typeof payload.totalAbsent === "number"
  ) {
    return [
      {
        name: payload.label || "Summary",
        present: payload.totalPresent ?? 0,
        absent: payload.totalAbsent ?? 0,
      },
    ];
  }

  return [];
};

const AttendanceChart = () => {
  const [data, setData] = useState<ChartDatum[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(false);

  const canFetch = useMemo(
    () => Boolean(DEFAULT_STUDENT_ID && DEFAULT_TERM_ID),
    []
  );

  useEffect(() => {
    if (!canFetch) return;

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/attendance/student/${DEFAULT_STUDENT_ID}/term/${DEFAULT_TERM_ID}/summary`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch attendance summary");
        }
        const payload = await response.json();
        const normalized = normalizeSummary(payload);
        if (normalized.length) {
          setData(normalized);
        }
      } catch (error) {
        console.error("[AttendanceChart] Falling back to static data:", error);
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [canFetch]);

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Attendance</h1>
          {loading && (
            <p className="text-xs text-gray-400 mt-1">Refreshing live data…</p>
          )}
        </div>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart width={500} height={300} data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
          />
          <Legend
            align="left"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
          />
          <Bar
            dataKey="present"
            fill="#FAE27C"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
          <Bar
            dataKey="absent"
            fill="#C3EBFA"
            legendType="circle"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
