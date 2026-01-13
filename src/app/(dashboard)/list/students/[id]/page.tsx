"use client";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  classArm?: {
    id: number;
    name?: string;
    armName?: string;
    classLevel?: {
      id: number;
      name?: string;
      className?: string;
    };
  };
};

type ClassArm = {
  id: number;
  name?: string;
  armName?: string;
  classLevelId?: number;
  classLevel?: {
    id: number;
    name?: string;
    className?: string;
  };
};

type ClassLevel = {
  id: number;
  name?: string;
  className?: string;
};

type Result = {
  id: number;
  subjectName?: string;
  subject?: { subjectName: string };
  score: number;
  grade?: string;
  term?: { name: string };
  termId?: number;
};

type Attendance = {
  id: number;
  date: string;
  status: string;
};

const SingleStudentPage = () => {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch student, class arms, class levels, results, and attendance in parallel
        const [
          studentRes,
          classArmsRes,
          classLevelsRes,
          resultsRes,
          attendanceRes,
        ] = await Promise.all([
          fetch(`/api/student/${params.id}`, { credentials: "include" }),
          fetch("/api/class/arms", { credentials: "include" }),
          fetch("/api/class/level", { credentials: "include" }),
          fetch(`/api/results/student/${params.id}`, {
            credentials: "include",
          }).catch(() => null),
          fetch(`/api/attendance/student/${params.id}`, {
            credentials: "include",
          }).catch(() => null),
        ]);

        if (!studentRes.ok) {
          throw new Error("Failed to fetch student");
        }

        const studentData = await studentRes.json();

        // Normalize - ensure student has an id
        const normalizedStudent = {
          ...studentData,
          id: String(
            studentData.id ||
              studentData.admissionNo ||
              studentData._id ||
              params.id
          ),
        };

        setStudent(normalizedStudent);

        // Handle class arms
        if (classArmsRes.ok) {
          const armsData = await classArmsRes.json();
          setClassArms(Array.isArray(armsData) ? armsData : []);
        }

        // Handle class levels
        if (classLevelsRes.ok) {
          const levelsData = await classLevelsRes.json();
          setClassLevels(Array.isArray(levelsData) ? levelsData : []);
        }

        // Handle results
        if (resultsRes?.ok) {
          const resultsData = await resultsRes.json();
          const resultsArray = Array.isArray(resultsData)
            ? resultsData
            : Array.isArray(resultsData?.data)
            ? resultsData.data
            : Array.isArray(resultsData?.results)
            ? resultsData.results
            : [];
          setResults(resultsArray.slice(0, 10)); // Show latest 10
        }

        // Handle attendance
        if (attendanceRes?.ok) {
          const attendanceData = await attendanceRes.json();
          const attendanceArray = Array.isArray(attendanceData)
            ? attendanceData
            : Array.isArray(attendanceData?.data)
            ? attendanceData.data
            : [];
          setAttendance(attendanceArray.slice(0, 10)); // Show latest 10
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Helper function to get class name
  const getClassName = (): string => {
    if (!student) return "N/A";

    // First try to get from nested classArm object
    if (student.classArm) {
      const levelName =
        student.classArm.classLevel?.className ||
        student.classArm.classLevel?.name ||
        "";
      const armName = student.classArm.armName || student.classArm.name || "";
      if (levelName && armName) return `${levelName} ${armName}`;
      if (levelName) return levelName;
      if (armName) return armName;
    }

    // Fall back to looking up in classArms array
    const classArm = classArms.find((arm) => arm.id === student.classArmId);
    if (classArm) {
      // Try to get level name from nested classLevel in arm
      let levelName =
        classArm.classLevel?.className || classArm.classLevel?.name || "";

      // If no nested classLevel, look up in classLevels array
      if (!levelName && classArm.classLevelId) {
        const classLevel = classLevels.find(
          (level) => level.id === classArm.classLevelId
        );
        levelName = classLevel?.className || classLevel?.name || "";
      }

      const armName = classArm.armName || classArm.name || "";
      if (levelName && armName) return `${levelName} ${armName}`;
      if (levelName) return levelName;
      if (armName) return armName;
    }

    return `Class ${student.classArmId}`;
  };

  // Calculate attendance stats
  const attendanceStats = {
    present: attendance.filter((a) => a.status === "Present").length,
    absent: attendance.filter((a) => a.status === "Absent").length,
    late: attendance.filter((a) => a.status === "Late").length,
    total: attendance.length,
  };

  // Calculate average score
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length
        )
      : 0;

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
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-lamaPurple text-white rounded-md hover:bg-lamaPurpleDark"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const className = getClassName();

  return (
    <div className="p-2 sm:p-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>←</span>
        <span>Back to Students</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT - Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Card */}
          <div className="bg-gradient-to-r from-lamaSky to-lamaSkyLight rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-lamaPurple">
                    {student.firstName?.charAt(0) || ""}
                    {student.lastName?.charAt(0) || ""}
                  </span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h1>
                  {role === "admin" && (
                    <FormModal table="student" type="update" data={student} />
                  )}
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-gray-700">
                    {student.admissionNo}
                  </span>
                  <span className="px-3 py-1 bg-green-100 rounded-full text-sm font-medium text-green-800">
                    {className}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      student.gender === "Male"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-pink-100 text-pink-800"
                    }`}
                  >
                    {student.gender}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-gray-500">Religion:</span>
                    <span className="font-medium">{student.religion}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-gray-500">DOB:</span>
                    <span className="font-medium">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-gray-500">Admitted:</span>
                    <span className="font-medium">
                      {student.yearOfAdmission
                        ? new Date(student.yearOfAdmission).getFullYear()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-blue-600">
                {className}
              </div>
              <div className="text-xs text-gray-500 mt-1">Current Class</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-green-600">
                {averageScore}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Avg. Score</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-purple-600">
                {attendanceStats.total > 0
                  ? Math.round(
                      (attendanceStats.present / attendanceStats.total) * 100
                    )
                  : 0}
                %
              </div>
              <div className="text-xs text-gray-500 mt-1">Attendance</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-orange-600">
                {results.length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Results</div>
            </div>
          </div>

          {/* Student Details */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Student Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">ID</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Admission No</h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {student.admissionNo}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">C</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Class</h3>
                </div>
                <p className="text-gray-700 font-medium">{className}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">Y</span>
                  </div>
                  <h3 className="font-medium text-gray-900">
                    Year of Admission
                  </h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {student.yearOfAdmission
                    ? new Date(student.yearOfAdmission).getFullYear()
                    : "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">G</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Gender</h3>
                </div>
                <p className="text-gray-700 font-medium">{student.gender}</p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">R</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Religion</h3>
                </div>
                <p className="text-gray-700 font-medium">{student.religion}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">D</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Date of Birth</h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {new Date(student.dateOfBirth).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Additional sidebar content can go here */}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate grade from score
const getGrade = (score: number): string => {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
};

export default SingleStudentPage;
