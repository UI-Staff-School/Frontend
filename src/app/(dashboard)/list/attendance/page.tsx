"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";

type AttendanceRecord = {
  id: string | number;
  date?: string;
  status?: string;
  isPresent?: boolean;
  period?: string;
  subjectName?: string;
  classArmName?: string;
};

const columns = [
  { header: "Date", accessor: "date" },
  { header: "Status", accessor: "status" },
  { header: "Class Arm", accessor: "classArmName", className: "hidden md:table-cell" },
  { header: "Subject/Period", accessor: "subjectName", className: "hidden md:table-cell" },
];

const AttendancePage = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [studentId, setStudentId] = useState("");
  const [termId, setTermId] = useState("");
  const [summary, setSummary] = useState<any | null>(null);

  const filteredAttendance = useMemo(() => {
    if (!search) return attendance;
    const lower = search.toLowerCase();
    return attendance.filter((item) => {
      const fields = [
        item.date,
        item.status,
        item.classArmName,
        item.subjectName,
        item.period,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return fields.some((f) => f.includes(lower));
    });
  }, [attendance, search]);

  const handleFetchAttendance = async () => {
    if (!studentId || !termId) {
      setError("Please provide both Student ID and Term ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/attendance/student/${studentId}/term/${termId}`
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch attendance");
      }

      const payload = await res.json();
      const data = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      const mapped: AttendanceRecord[] = data.map((item: any, idx: number) => {
        const rawDate =
          item.date || item.attendanceDate || item.createdAt || item.day;
        const date = rawDate
          ? new Date(rawDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
        const isPresent =
          item.isPresent ??
          String(item.status || item.attendanceStatus || "")
            .toLowerCase()
            .includes("present");
        const status = isPresent ? "Present" : "Absent";

        return {
          id: item.id ?? idx,
          date,
          status,
          isPresent,
          period: item.period || item.lesson || item.slot || "",
          subjectName: item.subjectName || item.subject || "",
          classArmName: item.classArmName || item.classArm || item.class || "",
        };
      });

      setAttendance(mapped);
    } catch (e: any) {
      setError(e.message || "Something went wrong while loading attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSummary = async () => {
    if (!studentId || !termId) {
      setError("Please provide both Student ID and Term ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/attendance/student/${studentId}/term/${termId}/summary`
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch summary");
      }
      const payload = await res.json();
      setSummary(payload);
    } catch (e: any) {
      setError(e.message || "Unable to load attendance summary");
    } finally {
      setLoading(false);
    }
  };

  const renderRow = (item: AttendanceRecord) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.date}</td>
      <td className="p-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.isPresent
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {item.status}
        </span>
      </td>
      <td className="hidden md:table-cell">{item.classArmName || "-"}</td>
      <td className="hidden md:table-cell">
        {item.subjectName || item.period || "-"}
      </td>
    </tr>
  );

  const presentCount = filteredAttendance.filter((a) => a.isPresent).length;
  const absentCount = filteredAttendance.length - presentCount;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Attendance</h1>
          <p className="text-xs text-gray-500 mt-1">
            View a student&apos;s attendance records and summary for a given term.
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            // placeholder="Search by date, status, class or subject..."
            // onSearchChange={setSearch}
          />
          <div className="flex items-center gap-4 self-end">
            <Link
              href="/list/attendance/mark"
              className="px-4 py-2 bg-lamaPurple text-white text-sm font-medium rounded-md hover:bg-lamaPurpleLight transition flex items-center gap-2"
            >
              <span>+</span>
              Mark Attendance
            </Link>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            Student ID
          </label>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="e.g. STU-0001"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lamaPurple"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Term ID</label>
          <input
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
            placeholder="e.g. TERM-0001"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lamaPurple"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleFetchAttendance}
            disabled={loading}
            className="flex-1 bg-lamaPurple text-white text-sm font-medium py-2.5 rounded-md hover:bg-lamaPurpleLight transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load Attendance"}
          </button>
          <button
            onClick={handleFetchSummary}
            disabled={loading}
            className="hidden md:inline-flex bg-white border border-gray-300 text-gray-700 text-xs font-medium py-2 px-3 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Summary
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="mt-4 grid gap-3 md:grid-cols-3 text-xs">
          <div className="border border-emerald-100 bg-emerald-50 rounded-md px-3 py-2">
            <p className="font-semibold text-emerald-700">Present</p>
            <p className="mt-1 text-emerald-800 text-sm">
              {summary.totalPresent ?? summary.present ?? "-"}
            </p>
          </div>
          <div className="border border-rose-100 bg-rose-50 rounded-md px-3 py-2">
            <p className="font-semibold text-rose-700">Absent</p>
            <p className="mt-1 text-rose-800 text-sm">
              {summary.totalAbsent ?? summary.absent ?? "-"}
            </p>
          </div>
          <div className="border border-indigo-100 bg-indigo-50 rounded-md px-3 py-2">
            <p className="font-semibold text-indigo-700">Overall</p>
            <p className="mt-1 text-indigo-800 text-sm">
              {summary.attendanceRate ??
                summary.percentage ??
                summary.rate ??
                "-"}
              {typeof (summary.attendanceRate ??
                summary.percentage ??
                summary.rate) === "number"
                ? "%"
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={filteredAttendance} />

      {/* SIMPLE COUNTS */}
      {filteredAttendance.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Showing {filteredAttendance.length} records —{" "}
          <span className="text-emerald-600 font-medium">
            {presentCount} present
          </span>{" "}
          /{" "}
          <span className="text-rose-600 font-medium">
            {absentCount} absent
          </span>
        </div>
      )}

      {/* PAGINATION (placeholder) */}
      <Pagination />
    </div>
  );
};

export default AttendancePage;


