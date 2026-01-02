"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface AttendanceRecord {
  id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

interface Child {
  admissionNo: string;
  firstName: string;
  lastName: string;
}

const ChildAttendancePage = () => {
  const params = useParams();
  const admissionNo = params.admissionNo as string;

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [childInfo, setChildInfo] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch child info and attendance
        const [childrenResponse, attendanceResponse] = await Promise.all([
          fetch("/api/parent/portal/children", { credentials: "include" }),
          fetch(`/api/parent/portal/children/${admissionNo}/attendance`, {
            credentials: "include",
          }),
        ]);

        if (childrenResponse.ok) {
          const children = await childrenResponse.json();
          const child = Array.isArray(children)
            ? children.find((c: Child) => c.admissionNo === admissionNo)
            : null;
          setChildInfo(child);
        }

        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();

          // Handle both array and object with records/summary
          if (Array.isArray(attendanceData)) {
            setAttendance(attendanceData);
            // Calculate summary from records
            const presentDays = attendanceData.filter((a: AttendanceRecord) => a.status === "present").length;
            const absentDays = attendanceData.filter((a: AttendanceRecord) => a.status === "absent").length;
            const lateDays = attendanceData.filter((a: AttendanceRecord) => a.status === "late").length;
            const excusedDays = attendanceData.filter((a: AttendanceRecord) => a.status === "excused").length;
            const totalDays = attendanceData.length;
            setSummary({
              totalDays,
              presentDays,
              absentDays,
              lateDays,
              excusedDays,
              attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
            });
          } else if (attendanceData.records) {
            setAttendance(attendanceData.records);
            setSummary(attendanceData.summary);
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    if (admissionNo) {
      fetchData();
    }
  }, [admissionNo]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700";
      case "absent":
        return "bg-red-100 text-red-700";
      case "late":
        return "bg-yellow-100 text-yellow-700";
      case "excused":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl m-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl m-4">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-semibold">Error loading attendance</p>
          <p className="text-sm">{error}</p>
          <Link
            href="/parent/children"
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Back to Children
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-2 text-teal-100 mb-2">
          <Link href="/parent/children" className="hover:text-white">
            My Children
          </Link>
          <span>/</span>
          <span>{childInfo?.firstName} {childInfo?.lastName}</span>
          <span>/</span>
          <span>Attendance</span>
        </div>
        <h1 className="text-2xl font-bold">
          {childInfo?.firstName} {childInfo?.lastName}&apos;s Attendance
        </h1>
        <p className="text-teal-100 mt-1">{admissionNo}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">
            {summary?.totalDays || 0}
          </p>
          <p className="text-sm text-gray-500">Total Days</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {summary?.presentDays || 0}
          </p>
          <p className="text-sm text-gray-500">Present</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">
            {summary?.absentDays || 0}
          </p>
          <p className="text-sm text-gray-500">Absent</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {summary?.lateDays || 0}
          </p>
          <p className="text-sm text-gray-500">Late</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-teal-600">
            {summary?.attendanceRate || 0}%
          </p>
          <p className="text-sm text-gray-500">Rate</p>
        </div>
      </div>

      {/* Attendance Progress */}
      <div className="bg-white rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Attendance Rate
        </h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-100">
                {summary?.attendanceRate || 0}% Present
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-100">
            <div
              style={{ width: `${summary?.attendanceRate || 0}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
            ></div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      {attendance.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📅</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Attendance Records
          </h2>
          <p className="text-gray-500">
            Attendance records will appear here once they are recorded.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Attendance
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {attendance.slice(0, 20).map((record) => (
              <div
                key={record.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {formatDate(record.date)}
                  </p>
                  {record.remarks && (
                    <p className="text-sm text-gray-500">{record.remarks}</p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                    record.status
                  )}`}
                >
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <Link
          href="/parent/children"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span>←</span> Back to My Children
        </Link>
      </div>
    </div>
  );
};

export default ChildAttendancePage;
