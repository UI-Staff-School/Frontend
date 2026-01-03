<<<<<<< HEAD
import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";

const StudentPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule (4A)</h1>
          <BigCalendar/>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
=======
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
            Unable to Load Profile
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
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
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white mb-6">
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
            <p className="text-sm text-indigo-100">
              Current Term: <span className="font-medium text-white">{activeTerm.name}</span>
              {activeTerm.session && (
                <span className="ml-2">({activeTerm.session.name})</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link
          href="/student/results"
          className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-semibold text-gray-800">My Results</h3>
          <p className="text-sm text-gray-500 mt-1">View your academic results</p>
        </Link>

        <Link
          href="/student/attendance"
          className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="font-semibold text-gray-800">Attendance</h3>
          <p className="text-sm text-gray-500 mt-1">Check your attendance record</p>
        </Link>

        <Link
          href="/student/fees"
          className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition-colors">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="font-semibold text-gray-800">Fees & Payments</h3>
          <p className="text-sm text-gray-500 mt-1">View fees and payment history</p>
        </Link>

        <Link
          href="/student/profile"
          className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
            <span className="text-2xl">👤</span>
          </div>
          <h3 className="font-semibold text-gray-800">My Profile</h3>
          <p className="text-sm text-gray-500 mt-1">View profile details</p>
        </Link>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
>>>>>>> origin/habyaad_dev
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default StudentPage;
=======
export default StudentDashboard;
>>>>>>> origin/habyaad_dev
