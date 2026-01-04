"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface RankedStudent {
  rank: number;
  studentId: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  totalScore: number;
  averageScore: number;
  subjectsCount: number;
  grade?: string;
  results?: Array<{
    subjectName: string;
    totalScore: number;
    grade: string;
  }>;
}

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
  isActive?: boolean;
  session?: {
    id: string | number;
    name: string;
  };
}

const ClassRankingsPage = () => {
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [rankings, setRankings] = useState<RankedStudent[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);

      const [classArmsRes, termsRes] = await Promise.all([
        fetch("/api/class/arms", { credentials: "include" }),
        fetch("/api/terms", { credentials: "include" }),
      ]);

      if (classArmsRes.ok) {
        const classData = await classArmsRes.json();
        const armsList = Array.isArray(classData)
          ? classData
          : Array.isArray(classData?.data)
          ? classData.data
          : Array.isArray(classData?.classArms)
          ? classData.classArms
          : [];
        setClassArms(armsList);
      }

      if (termsRes.ok) {
        const termsData = await termsRes.json();
        const termsList = termsData?.terms || [];
        setTerms(termsList);

        // Auto-select active term
        const activeTerm = termsList.find((t: Term) => t.isActive);
        if (activeTerm) {
          setSelectedTerm(String(activeTerm.id));
        }
      }
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRankings = async () => {
    if (!selectedClass || !selectedTerm) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/results/class/${selectedClass}/term/${selectedTerm}/ranking`,
        { credentials: "include" }
      );

      if (res.ok) {
        const data = await res.json();
        const rankingsList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.rankings)
          ? data.rankings
          : Array.isArray(data?.students)
          ? data.students
          : [];
        setRankings(rankingsList);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to fetch rankings");
        setRankings([]);
      }
    } catch (err: any) {
      console.error("Error fetching rankings:", err);
      setError(err.message || "Failed to fetch rankings");
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-lg">🥇</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-lg">🥈</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-lg">🥉</span>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 font-bold">{rank}</span>
      </div>
    );
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return "bg-gray-100 text-gray-700";
    const g = grade.toUpperCase();
    if (g === "A" || g === "A1") return "bg-green-100 text-green-700";
    if (g === "B" || g === "B2" || g === "B3") return "bg-blue-100 text-blue-700";
    if (g === "C" || g === "C4" || g === "C5" || g === "C6")
      return "bg-yellow-100 text-yellow-700";
    if (g === "D" || g === "D7") return "bg-orange-100 text-orange-700";
    if (g === "E" || g === "E8") return "bg-red-100 text-red-700";
    if (g === "F" || g === "F9") return "bg-red-200 text-red-800";
    return "bg-gray-100 text-gray-700";
  };

  const selectedClassArm = classArms.find((c) => String(c.id) === selectedClass);
  const selectedTermObj = terms.find((t) => String(t.id) === selectedTerm);

  // Calculate class statistics
  const classStats = {
    totalStudents: rankings.length,
    classAverage:
      rankings.length > 0
        ? rankings.reduce((sum, r) => sum + (r.averageScore || 0), 0) / rankings.length
        : 0,
    highestScore: rankings.length > 0 ? rankings[0]?.totalScore || 0 : 0,
    lowestScore:
      rankings.length > 0 ? rankings[rankings.length - 1]?.totalScore || 0 : 0,
  };

  if (initialLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/list/results" className="hover:text-gray-700">
          Results
        </Link>
        <span>/</span>
        <span className="text-gray-800">Class Rankings</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏆</span>
          <h1 className="text-2xl font-bold">Class Rankings</h1>
        </div>
        <p className="text-indigo-100">
          View student performance rankings by class and term
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setRankings([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a class...</option>
              {classArms.map((arm) => (
                <option key={arm.id} value={arm.id}>
                  {arm.classLevel?.name} {arm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => {
                setSelectedTerm(e.target.value);
                setRankings([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a term...</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name}
                  {term.session ? ` (${term.session.name})` : ""}
                  {term.isActive ? " - Current" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchRankings}
              disabled={!selectedClass || !selectedTerm || loading}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "View Rankings"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Class Statistics */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {classStats.totalStudents}
            </p>
            <p className="text-sm text-gray-500">Students Ranked</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {classStats.classAverage.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">Class Average</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {classStats.highestScore}
            </p>
            <p className="text-sm text-gray-500">Highest Total</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {classStats.lowestScore}
            </p>
            <p className="text-sm text-gray-500">Lowest Total</p>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="bg-white rounded-xl overflow-hidden">
        {selectedClassArm && selectedTermObj && rankings.length > 0 && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800">
              {selectedClassArm.classLevel?.name} {selectedClassArm.name} -{" "}
              {selectedTermObj.name}
            </h2>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : !selectedClass || !selectedTerm ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏆</span>
            </div>
            <p className="font-medium">Select Class and Term</p>
            <p className="text-sm mt-1">
              Choose a class and term to view rankings
            </p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            </div>
            <p className="font-medium">No Rankings Available</p>
            <p className="text-sm mt-1">
              No results found for the selected class and term
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rankings.map((student, index) => (
              <div
                key={student.studentId}
                className={`transition-colors ${
                  index < 3 ? "bg-gradient-to-r from-white to-yellow-50/30" : ""
                }`}
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setExpandedStudent(
                      expandedStudent === student.studentId
                        ? null
                        : student.studentId
                    )
                  }
                >
                  {/* Rank Badge */}
                  {getRankBadge(student.rank || index + 1)}

                  {/* Student Info */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{student.admissionNo}</p>
                  </div>

                  {/* Scores */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-indigo-600">
                      {student.totalScore}
                    </p>
                    <p className="text-sm text-gray-500">
                      Avg: {student.averageScore?.toFixed(1) || "-"}
                    </p>
                  </div>

                  {/* Grade */}
                  {student.grade && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(
                        student.grade
                      )}`}
                    >
                      {student.grade}
                    </span>
                  )}

                  {/* Expand Icon */}
                  <Image
                    src="/moreDark.png"
                    alt="Expand"
                    width={16}
                    height={16}
                    className={`transform transition-transform ${
                      expandedStudent === student.studentId ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Expanded Subject Results */}
                {expandedStudent === student.studentId && student.results && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4 ml-14">
                      <p className="text-sm font-medium text-gray-600 mb-3">
                        Subject Breakdown ({student.subjectsCount} subjects)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {student.results.map((result, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-lg p-2 text-sm"
                          >
                            <p className="text-gray-600 truncate">
                              {result.subjectName}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-medium">
                                {result.totalScore}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${getGradeColor(
                                  result.grade
                                )}`}
                              >
                                {result.grade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href="/list/results"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span>&#8592;</span> Back to Results
        </Link>
      </div>
    </div>
  );
};

export default ClassRankingsPage;
