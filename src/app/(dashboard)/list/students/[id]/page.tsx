"use client";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Student = {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  address: string;
  classArmId: number;
  yearOfAdmission: string;
};

const SingleStudentPage = () => {
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/${params.id}`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch student");
        }
        const data = await response.json();
        setStudent(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lamaPurple mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading student...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">
              Error: {error || "Student not found"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-lamaPurple text-white rounded-md hover:bg-lamaPurpleDark"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 gap-4 grid grid-cols-1 lg:grid-cols-3">
      {/* LEFT */}
      <div className="w-full lg:col-span-2">
        {/* TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-4 sm:py-6 px-3 sm:px-4 rounded-md lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl sm:text-4xl font-medium text-gray-600">
                    {student.firstName.charAt(0)}
                    {student.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                    {student.firstName} {student.lastName}
                  </h1>
                  {role === "admin" && (
                    <div className="flex justify-center sm:justify-start">
                      <FormModal table="student" type="update" data={student} />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center sm:text-left">
                  Student - Class {student.classArmId}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Image
                      src="/blood.png"
                      alt=""
                      width={12}
                      height={12}
                      className="sm:w-3.5 sm:h-3.5"
                    />
                    <span className="truncate">{student.gender}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Image
                      src="/date.png"
                      alt=""
                      width={12}
                      height={12}
                      className="sm:w-3.5 sm:h-3.5"
                    />
                    <span className="truncate">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Image
                      src="/mail.png"
                      alt=""
                      width={12}
                      height={12}
                      className="sm:w-3.5 sm:h-3.5"
                    />
                    <span className="truncate">{student.admissionNo}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Image
                      src="/phone.png"
                      alt=""
                      width={12}
                      height={12}
                      className="sm:w-3.5 sm:h-3.5"
                    />
                    <span className="truncate">Class {student.classArmId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-4">
              {/* CARD */}
              <div className="bg-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Image
                  src="/singleAttendance.png"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 sm:w-6 sm:h-6 mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl font-semibold">
                    {student.admissionNo}
                  </h1>
                  <span className="text-xs sm:text-sm text-gray-400">
                    Admission No
                  </span>
                </div>
              </div>
              {/* CARD */}
              <div className="bg-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Image
                  src="/singleBranch.png"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 sm:w-6 sm:h-6 mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl font-semibold">
                    Class {student.classArmId}
                  </h1>
                  <span className="text-xs sm:text-sm text-gray-400">
                    Class Arm
                  </span>
                </div>
              </div>
              {/* CARD */}
              <div className="bg-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Image
                  src="/singleLesson.png"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 sm:w-6 sm:h-6 mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl font-semibold">
                    {new Date(student.yearOfAdmission).getFullYear()}
                  </h1>
                  <span className="text-xs sm:text-sm text-gray-400">
                    Year of Admission
                  </span>
                </div>
              </div>
              {/* CARD */}
              <div className="bg-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Image
                  src="/singleClass.png"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 sm:w-6 sm:h-6 mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl font-semibold">
                    {student.religion}
                  </h1>
                  <span className="text-xs sm:text-sm text-gray-400">
                    Religion
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM - Student Details */}
        <div className="mt-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Student Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">🆔</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Admission No
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {student.admissionNo}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">🎓</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Class Arm
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                Class {student.classArmId}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">📅</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Year of Admission
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {new Date(student.yearOfAdmission).getFullYear()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">👤</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Gender
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {student.gender}
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">🕊️</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Religion
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {student.religion}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">📅</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Date of Birth
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {new Date(student.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:col-span-1 grid gap-4 sm:gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Contact Information
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                <span className="text-purple-600 text-xs sm:text-sm">📍</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">
                  {student.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <span className="text-blue-600 text-sm sm:text-base">📧</span>
              <span className="text-gray-700 text-sm sm:text-base">
                Contact Parent
              </span>
            </button>
            <button className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <span className="text-green-600 text-sm sm:text-base">📊</span>
              <span className="text-gray-700 text-sm sm:text-base">
                View Grades
              </span>
            </button>
            <button className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              <span className="text-purple-600 text-sm sm:text-base">📄</span>
              <span className="text-gray-700 text-sm sm:text-base">
                View Profile
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleStudentPage;
