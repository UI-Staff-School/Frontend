"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";

interface Alumni {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  graduationYear?: string;
  graduationSession?: {
    id: string | number;
    name: string;
  };
  lastClass?: {
    name: string;
    classLevel?: {
      name: string;
    };
  };
  dateOfBirth?: string;
}

interface AlumniStats {
  totalAlumni?: number;
  totalMale?: number;
  totalFemale?: number;
  bySession?: Array<{
    sessionId: string | number;
    sessionName: string;
    count: number;
  }>;
}

interface Session {
  id: string | number;
  name: string;
  academicYear?: string;
}

const columns = [
  { header: "Info", accessor: "info" },
  { header: "Admission No", accessor: "admissionNo", className: "hidden md:table-cell" },
  { header: "Gender", accessor: "gender", className: "hidden md:table-cell" },
  { header: "Graduation", accessor: "graduation", className: "hidden lg:table-cell" },
  { header: "Last Class", accessor: "lastClass", className: "hidden lg:table-cell" },
  { header: "Actions", accessor: "actions" },
];

const AlumniPage = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [stats, setStats] = useState<AlumniStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedGender, setSelectedGender] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch alumni, stats, and sessions in parallel
      const [alumniRes, statsRes, sessionsRes] = await Promise.all([
        fetch("/api/alumni", { credentials: "include" }),
        fetch("/api/alumni/statistics", { credentials: "include" }),
        fetch("/api/session", { credentials: "include" }),
      ]);

      if (alumniRes.ok) {
        const alumniData = await alumniRes.json();
        const list = Array.isArray(alumniData)
          ? alumniData
          : Array.isArray(alumniData?.data)
          ? alumniData.data
          : Array.isArray(alumniData?.alumni)
          ? alumniData.alumni
          : [];
        setAlumni(list);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        const sessionList = Array.isArray(sessionsData)
          ? sessionsData
          : Array.isArray(sessionsData?.data)
          ? sessionsData.data
          : [];
        setSessions(sessionList);
      }
    } catch (err: any) {
      console.error("Error fetching alumni:", err);
      setError(err.message || "Failed to load alumni");
    } finally {
      setLoading(false);
    }
  };

  const fetchBySession = async (sessionId: string) => {
    if (!sessionId) {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/alumni/session/${sessionId}`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];
        setAlumni(list);
      }
    } catch (err: any) {
      console.error("Error fetching alumni by session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter alumni based on search and filters
  const filteredAlumni = useMemo(() => {
    let filtered = [...alumni];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((a) => {
        const fullName = `${a.firstName} ${a.middleName || ""} ${a.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          a.admissionNo?.toLowerCase().includes(searchLower) ||
          a.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Gender filter
    if (selectedGender) {
      filtered = filtered.filter(
        (a) => a.gender?.toLowerCase() === selectedGender.toLowerCase()
      );
    }

    return filtered;
  }, [alumni, search, selectedGender]);

  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    fetchBySession(sessionId);
  };

  const renderRow = (item: Alumni) => (
    <tr
      key={item.admissionNo || item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {item.firstName?.[0]}
              {item.lastName?.[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {item.firstName} {item.middleName} {item.lastName}
            </h3>
            {item.email && (
              <p className="text-xs text-gray-500">{item.email}</p>
            )}
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4 text-gray-600">
        {item.admissionNo}
      </td>
      <td className="hidden md:table-cell p-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.gender?.toLowerCase() === "male"
              ? "bg-blue-50 text-blue-700"
              : item.gender?.toLowerCase() === "female"
              ? "bg-pink-50 text-pink-700"
              : "bg-gray-50 text-gray-700"
          }`}
        >
          {item.gender || "-"}
        </span>
      </td>
      <td className="hidden lg:table-cell p-4 text-gray-600">
        {item.graduationSession?.name || item.graduationYear || "-"}
      </td>
      <td className="hidden lg:table-cell p-4 text-gray-600">
        {item.lastClass?.classLevel?.name} {item.lastClass?.name || "-"}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/list/alumni/${item.admissionNo}`}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky hover:bg-lamaSkyLight transition"
          >
            <Image src="/view.png" alt="View" width={16} height={16} />
          </Link>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-semibold">Error loading alumni</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Alumni</h1>
          <p className="text-xs text-gray-500 mt-1">
            View and track graduated students
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">
            {stats?.totalAlumni || alumni.length}
          </p>
          <p className="text-sm text-gray-600">Total Alumni</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {stats?.totalMale || alumni.filter((a) => a.gender?.toLowerCase() === "male").length}
          </p>
          <p className="text-sm text-gray-600">Male</p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-pink-600">
            {stats?.totalFemale || alumni.filter((a) => a.gender?.toLowerCase() === "female").length}
          </p>
          <p className="text-sm text-gray-600">Female</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">
            {sessions.length}
          </p>
          <p className="text-sm text-gray-600">Sessions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <TableSearch />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedSession}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name || session.academicYear}
                </option>
              ))}
            </select>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alumni Table */}
      {filteredAlumni.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <p className="font-medium">No alumni found</p>
          <p className="text-sm mt-1">
            {search || selectedSession || selectedGender
              ? "Try adjusting your filters"
              : "Alumni will appear here after student promotion"}
          </p>
        </div>
      ) : (
        <>
          <Table columns={columns} renderRow={renderRow} data={filteredAlumni} />
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredAlumni.length} alumni
          </div>
        </>
      )}

      <Pagination />
    </div>
  );
};

export default AlumniPage;
