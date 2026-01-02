"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ClassArm {
  id: string | number;
  name: string;
  classLevel?: {
    id: string | number;
    name: string;
  };
}

interface Term {
  id: string | number;
  name: string;
  year?: string;
}

interface Student {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender?: string;
}

interface AttendanceRecord {
  studentId: string | number;
  status: "present" | "absent" | "late" | "excused";
}

const MarkAttendancePage = () => {
  const router = useRouter();

  // Form state
  const [classArmId, setClassArmId] = useState<string>("");
  const [termId, setTermId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Data state
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch class arms and terms on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [classArmsRes, termsRes] = await Promise.all([
          fetch("/api/class/arms", { credentials: "include" }),
          fetch("/api/terms", { credentials: "include" }),
        ]);

        if (classArmsRes.ok) {
          const classArmsData = await classArmsRes.json();
          setClassArms(Array.isArray(classArmsData) ? classArmsData : []);
        }

        if (termsRes.ok) {
          const termsData = await termsRes.json();
          setTerms(Array.isArray(termsData?.terms) ? termsData.terms : []);
        }
      } catch (err: any) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load class arms and terms");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch students when class arm is selected
  const handleLoadStudents = async () => {
    if (!classArmId) {
      setError("Please select a class arm first");
      return;
    }

    setLoadingStudents(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/class/${classArmId}/students`, {
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch students");
      }

      const studentsData = await res.json();
      const studentsList = Array.isArray(studentsData) ? studentsData : [];
      setStudents(studentsList);

      // Initialize attendance records with all students as present
      setAttendanceRecords(
        studentsList.map((student: Student) => ({
          studentId: student.id,
          status: "present" as const,
        }))
      );
    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.message || "Failed to load students");
      setStudents([]);
      setAttendanceRecords([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Update individual student status
  const handleStatusChange = (studentId: string | number, status: AttendanceRecord["status"]) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  // Bulk actions
  const handleMarkAllPresent = () => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, status: "present" as const }))
    );
  };

  const handleMarkAllAbsent = () => {
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, status: "absent" as const }))
    );
  };

  // Submit attendance
  const handleSubmit = async () => {
    if (!classArmId || !termId || !date) {
      setError("Please fill in all required fields");
      return;
    }

    if (students.length === 0) {
      setError("Please load students first");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        classArmId: Number(classArmId),
        termId: Number(termId),
        date,
        records: attendanceRecords.map((record) => ({
          studentId: record.studentId,
          status: record.status,
        })),
      };

      const res = await fetch("/api/attendance/mark-class-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save attendance");
      }

      setSuccess("Attendance marked successfully!");

      // Redirect after short delay
      setTimeout(() => {
        router.push("/list/attendance");
      }, 1500);
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      setError(err.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 border-green-200";
      case "absent":
        return "bg-red-100 text-red-700 border-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "excused":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Stats
  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;
  const lateCount = attendanceRecords.filter((r) => r.status === "late").length;
  const excusedCount = attendanceRecords.filter((r) => r.status === "excused").length;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/list/attendance" className="hover:text-gray-700">
              Attendance
            </Link>
            <span>/</span>
            <span className="text-gray-800">Mark Attendance</span>
          </div>
          <h1 className="text-lg font-semibold">Mark Class Attendance</h1>
          <p className="text-xs text-gray-500 mt-1">
            Select a class and term, then mark attendance for all students
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Class Arm *</label>
          <select
            value={classArmId}
            onChange={(e) => {
              setClassArmId(e.target.value);
              setStudents([]);
              setAttendanceRecords([]);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lamaPurple"
            disabled={loading}
          >
            <option value="">Select class arm</option>
            {classArms.map((arm) => (
              <option key={arm.id} value={arm.id}>
                {arm.classLevel?.name} {arm.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Term *</label>
          <select
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lamaPurple"
            disabled={loading}
          >
            <option value="">Select term</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name} {term.year ? `(${term.year})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lamaPurple"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleLoadStudents}
            disabled={!classArmId || loadingStudents}
            className="w-full bg-lamaPurple text-white text-sm font-medium py-2.5 rounded-md hover:bg-lamaPurpleLight transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStudents ? "Loading..." : "Load Students"}
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-100 rounded-md px-4 py-3">
          {success}
        </div>
      )}

      {/* Students List */}
      {students.length > 0 && (
        <>
          {/* Bulk Actions & Stats */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Bulk Actions:</span>
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition"
              >
                Mark All Present
              </button>
              <button
                onClick={handleMarkAllAbsent}
                className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition"
              >
                Mark All Absent
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-600 font-medium">{presentCount} Present</span>
              <span className="text-red-600 font-medium">{absentCount} Absent</span>
              <span className="text-yellow-600 font-medium">{lateCount} Late</span>
              <span className="text-blue-600 font-medium">{excusedCount} Excused</span>
            </div>
          </div>

          {/* Students Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 w-12">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                    Student Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 hidden md:table-cell">
                    Admission No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 hidden md:table-cell">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 w-40">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((student, index) => {
                  const record = attendanceRecords.find(
                    (r) => r.studentId === student.id
                  );
                  const currentStatus = record?.status || "present";

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-800">
                          {student.firstName} {student.lastName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        {student.admissionNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize hidden md:table-cell">
                        {student.gender || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              student.id,
                              e.target.value as AttendanceRecord["status"]
                            )
                          }
                          className={`w-full px-3 py-1.5 text-xs font-medium rounded-md border focus:outline-none focus:ring-1 focus:ring-lamaPurple ${getStatusColor(
                            currentStatus
                          )}`}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                          <option value="late">Late</option>
                          <option value="excused">Excused</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/list/attendance"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting || !termId}
              className="px-6 py-2 text-sm font-medium text-white bg-lamaPurple rounded-md hover:bg-lamaPurpleLight transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loadingStudents && students.length === 0 && classArmId && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <p className="font-medium">No students loaded</p>
          <p className="text-sm mt-1">
            Click &quot;Load Students&quot; to fetch students for the selected class
          </p>
        </div>
      )}

      {/* Initial State */}
      {!classArmId && (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <p className="font-medium">Select a class to get started</p>
          <p className="text-sm mt-1">
            Choose a class arm and term, then load students to mark attendance
          </p>
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
