"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AttendanceRecord {
  id: string | number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remark?: string;
}

interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
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

interface Term {
  id: string | number;
  name: string;
  isActive?: boolean;
  session?: {
    id: string | number;
    name: string;
  };
}

const StudentAttendancePage = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentRes, termsRes] = await Promise.all([
        fetch("/api/student/me", { credentials: "include" }),
        fetch("/api/terms", { credentials: "include" }),
      ]);

      if (!studentRes.ok) {
        const errorData = await studentRes.json();
        setError(errorData.error || "Failed to load profile");
        return;
      }

      const studentData = await studentRes.json();
      setStudent(studentData);

      if (termsRes.ok) {
        const termsData = await termsRes.json();
        const termsList = termsData?.terms || [];
        setTerms(termsList);

        // Find active term
        const activeTerm = termsList.find((t: Term) => t.isActive);
        if (activeTerm) {
          setSelectedTerm(String(activeTerm.id));
          await fetchAttendance(studentData.id, String(activeTerm.id));
        }
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (studentId: string | number, termId: string) => {
    try {
      setLoading(true);

      const [attendanceRes, summaryRes] = await Promise.all([
        fetch(`/api/attendance/student/${studentId}/term/${termId}`, {
          credentials: "include",
        }),
        fetch(`/api/attendance/student/${studentId}/term/${termId}/summary`, {
          credentials: "include",
        }),
      ]);

      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        const attendanceList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.attendance)
          ? data.attendance
          : [];
        setAttendance(attendanceList);
      } else {
        setAttendance([]);
      }

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } else {
        // Calculate summary from attendance data
        const present = attendance.filter((a) => a.status === "present").length;
        const absent = attendance.filter((a) => a.status === "absent").length;
        const late = attendance.filter((a) => a.status === "late").length;
        const excused = attendance.filter((a) => a.status === "excused").length;
        const total = attendance.length;
        setSummary({
          totalDays: total,
          presentDays: present,
          absentDays: absent,
          lateDays: late,
          excusedDays: excused,
          attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0,
        });
      }
    } catch (err: any) {
      console.error("Error fetching attendance:", err);
      setAttendance([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId);
    if (student && termId) {
      fetchAttendance(student.id, termId);
    }
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    if (!student || !selectedTerm || attendance.length === 0) return;

    try {
      setExporting(format);
      const selectedTermObj = terms.find((t) => String(t.id) === selectedTerm);
      const response = await fetch(
        `/api/export/attendance/student/${student.id}/term/${selectedTerm}?format=${format}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to export attendance");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-${student.admissionNo}-${selectedTermObj?.name || "term"}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Export error:", err);
      setError(err.message || "Failed to export attendance");
    } finally {
      setExporting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate local summary if API doesn't provide one
  const calculatedSummary: AttendanceSummary = summary || {
    totalDays: attendance.length,
    presentDays: attendance.filter((a) => a.status === "present").length,
    absentDays: attendance.filter((a) => a.status === "absent").length,
    lateDays: attendance.filter((a) => a.status === "late").length,
    excusedDays: attendance.filter((a) => a.status === "excused").length,
    attendanceRate:
      attendance.length > 0
        ? ((attendance.filter((a) => a.status === "present" || a.status === "late").length) /
            attendance.length) *
          100
        : 0,
  };

  if (loading && !student) {
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
            Unable to Load Attendance
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
        <span className="text-gray-800">My Attendance</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold">My Attendance Record</h1>
        <p className="text-blue-100 mt-1">
          {student?.firstName} {student?.lastName} - {student?.admissionNo}
        </p>
        {student?.classArm && (
          <p className="text-blue-100 text-sm">
            {student.classArm.classLevel?.name} {student.classArm.name}
          </p>
        )}
      </div>

      {/* Term Selector */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Select Term:
          </label>
          <select
            value={selectedTerm}
            onChange={(e) => handleTermChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a term</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
                {term.session ? ` (${term.session.name})` : ""}
                {term.isActive ? " - Current" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Summary */}
      {selectedTerm && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">
              {calculatedSummary.totalDays}
            </p>
            <p className="text-sm text-gray-500">Total Days</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {calculatedSummary.presentDays}
            </p>
            <p className="text-sm text-gray-500">Present</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {calculatedSummary.absentDays}
            </p>
            <p className="text-sm text-gray-500">Absent</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {calculatedSummary.lateDays}
            </p>
            <p className="text-sm text-gray-500">Late</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center col-span-2 md:col-span-1">
            <p className="text-2xl font-bold text-indigo-600">
              {calculatedSummary.attendanceRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Attendance Rate</p>
          </div>
        </div>
      )}

      {/* Attendance Progress Bar */}
      {selectedTerm && calculatedSummary.totalDays > 0 && (
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">
              Attendance Overview
            </h3>
            {attendance.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Export:</span>
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={exporting !== null}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {exporting === "pdf" ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  )}
                  PDF
                </button>
                <button
                  onClick={() => handleExport("xlsx")}
                  disabled={exporting !== null}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {exporting === "xlsx" ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  )}
                  Excel
                </button>
              </div>
            )}
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 transition-all"
              style={{
                width: `${(calculatedSummary.presentDays / calculatedSummary.totalDays) * 100}%`,
              }}
              title={`Present: ${calculatedSummary.presentDays} days`}
            ></div>
            <div
              className="bg-yellow-500 transition-all"
              style={{
                width: `${(calculatedSummary.lateDays / calculatedSummary.totalDays) * 100}%`,
              }}
              title={`Late: ${calculatedSummary.lateDays} days`}
            ></div>
            <div
              className="bg-blue-500 transition-all"
              style={{
                width: `${(calculatedSummary.excusedDays / calculatedSummary.totalDays) * 100}%`,
              }}
              title={`Excused: ${calculatedSummary.excusedDays} days`}
            ></div>
            <div
              className="bg-red-500 transition-all"
              style={{
                width: `${(calculatedSummary.absentDays / calculatedSummary.totalDays) * 100}%`,
              }}
              title={`Absent: ${calculatedSummary.absentDays} days`}
            ></div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded"></span> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-500 rounded"></span> Late
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-blue-500 rounded"></span> Excused
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded"></span> Absent
            </span>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Attendance History</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : !selectedTerm ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <p className="font-medium">Select a Term</p>
            <p className="text-sm mt-1">
              Choose a term to view your attendance
            </p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <p className="font-medium">No Attendance Records</p>
            <p className="text-sm mt-1">
              No attendance records found for the selected term
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {formatDate(record.date)}
                  </p>
                  {record.remark && (
                    <p className="text-sm text-gray-500 mt-1">{record.remark}</p>
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

export default StudentAttendancePage;
