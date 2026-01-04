"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";

interface Teacher {
  id: string | number;
  staffId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  subjects?: Array<{ id: string | number; name: string }>;
  classArms?: Array<{ id: string | number; name: string }>;
}

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch("/api/staff/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setTeacher(data);
        }
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, []);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {loading ? "Loading..." : `Welcome, ${teacher?.firstName || "Teacher"}!`}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage your classes and view your schedule</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link
          href="/list/students"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow group border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Students</h3>
          <p className="text-sm text-gray-500 mt-1">View all students</p>
        </Link>

        <Link
          href="/list/classes"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow group border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Classes</h3>
          <p className="text-sm text-gray-500 mt-1">View class list</p>
        </Link>

        <Link
          href="/list/results"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow group border border-gray-100"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Results</h3>
          <p className="text-sm text-gray-500 mt-1">Manage results</p>
        </Link>

        <Link
          href="/list/attendance"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow group border border-gray-100"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Attendance</h3>
          <p className="text-sm text-gray-500 mt-1">Mark attendance</p>
        </Link>
      </div>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* LEFT - Schedule */}
        <div className="w-full xl:w-2/3">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900">My Schedule</h2>
              </div>
            </div>
            <BigCalendar />
          </div>
        </div>

        {/* RIGHT - Announcements */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <Announcements />
          </div>

          {/* Teacher Info Card */}
          {teacher && (
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{teacher.firstName} {teacher.lastName}</h3>
                    <p className="text-sm text-white/80">{teacher.role || "Teacher"}</p>
                  </div>
                </div>
                {teacher.email && (
                  <p className="text-sm text-white/80 mb-1">{teacher.email}</p>
                )}
                {teacher.phone && (
                  <p className="text-sm text-white/80">{teacher.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
