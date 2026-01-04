"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Student {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  address?: string;
  classArm?: {
    id: string | number;
    name: string;
    classLevel?: {
      id: string | number;
      name: string;
    };
  };
  parents?: Array<{
    id: string | number;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  }>;
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

const StudentDashboard = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentRes, termsRes] = await Promise.all([
        fetch("/api/student/me", { credentials: "include" }),
        fetch("/api/terms", { credentials: "include" }),
      ]);

      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudent(studentData);
      } else {
        const errorData = await studentRes.json();
        setError(errorData.error || "Failed to load profile");
      }

      if (termsRes.ok) {
        const termsData = await termsRes.json();
        const terms = termsData?.terms || [];
        const active = terms.find((t: Term) => t.isActive);
        if (active) setActiveTerm(active);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Profile
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-green-500/20 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold">
              {student?.firstName?.[0]}
              {student?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {student?.firstName}!
            </h1>
            <p className="text-indigo-100">{student?.admissionNo}</p>
            {student?.classArm && (
              <p className="text-indigo-100 text-sm mt-1">
                {student.classArm.classLevel?.name} - {student.classArm.name}
              </p>
            )}
          </div>
        </div>
        {activeTerm && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-green-100">
              Current Term: <span className="font-medium text-white">{activeTerm.name}</span>
              {activeTerm.session && (
                <span className="ml-2">({activeTerm.session.name})</span>
              )}
            </p>
          </div>
        )}
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link
          href="/student/results"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow group border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
<<<<<<< HEAD
=======
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
>>>>>>> habyaad_dev
          </div>
          <h3 className="font-semibold text-gray-900">My Results</h3>
          <p className="text-sm text-gray-500 mt-1">View academic results</p>
        </Link>

        <Link
          href="/student/attendance"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow group border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
<<<<<<< HEAD
=======
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
>>>>>>> habyaad_dev
          </div>
          <h3 className="font-semibold text-gray-900">Attendance</h3>
          <p className="text-sm text-gray-500 mt-1">Check attendance record</p>
        </Link>

        <Link
          href="/student/fees"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow group border border-gray-100"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Fees & Payments</h3>
          <p className="text-sm text-gray-500 mt-1">View payment history</p>
        </Link>

        <Link
          href="/student/profile"
          className="bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow group border border-gray-100"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
<<<<<<< HEAD
=======
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
>>>>>>> habyaad_dev
          </div>
          <h3 className="font-semibold text-gray-900">My Profile</h3>
          <p className="text-sm text-gray-500 mt-1">View profile details</p>
        </Link>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Full Name</span>
              <span className="font-medium text-gray-800">
                {student?.firstName} {student?.lastName}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Admission No</span>
              <span className="font-medium text-gray-800">
                {student?.admissionNo}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Date of Birth</span>
              <span className="font-medium text-gray-800">
                {formatDate(student?.dateOfBirth)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Gender</span>
              <span className="font-medium text-gray-800 capitalize">
                {student?.gender || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Religion</span>
              <span className="font-medium text-gray-800 capitalize">
                {student?.religion || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Class</span>
              <span className="font-medium text-gray-800">
                {student?.classArm
                  ? `${student.classArm.classLevel?.name || ""} ${student.classArm.name}`
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Parent/Guardian Information
          </h2>
          {student?.parents && student.parents.length > 0 ? (
            <div className="space-y-4">
              {student.parents.map((parent, index) => (
                <div
                  key={parent.id || index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <p className="font-medium text-gray-800">
                    {parent.firstName} {parent.lastName}
                  </p>
                  {parent.phone && (
                    <p className="text-sm text-gray-500 mt-1">
                      Phone: {parent.phone}
                    </p>
                  )}
                  {parent.email && (
                    <p className="text-sm text-gray-500">
                      Email: {parent.email}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No parent/guardian information available</p>
            </div>
          )}

          {/* Address */}
          {student?.address && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
              <p className="text-gray-800">{student.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
