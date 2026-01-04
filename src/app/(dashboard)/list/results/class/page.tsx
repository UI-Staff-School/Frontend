"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Protected from "@/components/Protected";

type ClassArm = {
  id: number;
  name: string;
  classLevel?: {
    id: number;
    name: string;
  };
};

type Term = {
  id: number;
  name: string;
  year?: string;
  session?: {
    id: number;
    name: string;
  };
};

type Result = {
  id: number;
  continuous: number;
  summary: number;
  total: number;
  comments?: string;
  student: {
    id: number;
    surname: string;
    firstname: string;
    othername?: string;
    admissionNo?: string;
  };
  subject: {
    id: number;
    name: string;
  };
};

type StudentResults = {
  student: {
    id: number;
    surname: string;
    firstname: string;
    othername?: string;
    admissionNo?: string;
  };
  results: {
    subjectId: number;
    subjectName: string;
    continuous: number;
    summary: number;
    total: number;
  }[];
  totalScore: number;
  average: number;
  subjectCount: number;
};

export default function ClassTermResultsPage() {
  const [role, setRole] = useState<string | undefined>(undefined);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [groupedResults, setGroupedResults] = useState<StudentResults[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setRole(userData.user?.role);

        const [classArmsRes, termsRes] = await Promise.all([
          fetch("/api/class/arms"),
          fetch("/api/terms"),
        ]);

        if (classArmsRes.ok) {
          const data = await classArmsRes.json();
          setClassArms(data.classArms || data || []);
        }

        if (termsRes.ok) {
          const data = await termsRes.json();
          setTerms(data.terms || data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fetchResults = async () => {
    if (!selectedClass || !selectedTerm) {
      setError("Please select class and term");
      return;
    }

    try {
      setFetching(true);
      setError("");
      setResults([]);
      setGroupedResults([]);
      setSubjects([]);

      const res = await fetch(
        `/api/results/class/${selectedClass}/term/${selectedTerm}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to fetch results");
      }

      const resultList: Result[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setResults(resultList);

      // Extract unique subjects
      const subjectNames = resultList.map((r) => r.subject.name);
      const uniqueSubjects = Array.from(new Set(subjectNames)).sort();
      setSubjects(uniqueSubjects);

      // Group results by student
      const studentMap = new Map<number, StudentResults>();

      resultList.forEach((result) => {
        const studentId = result.student.id;

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            student: result.student,
            results: [],
            totalScore: 0,
            average: 0,
            subjectCount: 0,
          });
        }

        const studentData = studentMap.get(studentId)!;
        studentData.results.push({
          subjectId: result.subject.id,
          subjectName: result.subject.name,
          continuous: result.continuous,
          summary: result.summary,
          total: result.total,
        });
        studentData.totalScore += result.total;
        studentData.subjectCount += 1;
      });

      // Calculate averages and sort by total score
      const grouped = Array.from(studentMap.values())
        .map((s) => ({
          ...s,
          average: s.subjectCount > 0 ? s.totalScore / s.subjectCount : 0,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

      setGroupedResults(grouped);
    } catch (err: any) {
      setError(err.message || "Failed to fetch results");
    } finally {
      setFetching(false);
    }
  };

  const getGrade = (total: number) => {
    if (total >= 70) return { grade: "A", color: "bg-green-100 text-green-700" };
    if (total >= 60) return { grade: "B", color: "bg-blue-100 text-blue-700" };
    if (total >= 50) return { grade: "C", color: "bg-yellow-100 text-yellow-700" };
    if (total >= 40) return { grade: "D", color: "bg-orange-100 text-orange-700" };
    return { grade: "F", color: "bg-red-100 text-red-700" };
  };

  const getOverallGrade = (average: number) => {
    return getGrade(average);
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    if (!selectedClass || !selectedTerm) return;

    try {
      setExporting(format);
      const response = await fetch(
        `/api/export/result/class/${selectedClass}/term/${selectedTerm}?format=${format}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to export results");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `class-results-${selectedClassData?.name || "class"}-${selectedTermData?.name || "term"}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to export results");
    } finally {
      setExporting(null);
    }
  };

  // Calculate class statistics
  const stats = groupedResults.length > 0 ? {
    studentCount: groupedResults.length,
    subjectCount: subjects.length,
    classAverage: (groupedResults.reduce((sum, s) => sum + s.average, 0) / groupedResults.length).toFixed(1),
    highestAvg: Math.max(...groupedResults.map((s) => s.average)).toFixed(1),
    lowestAvg: Math.min(...groupedResults.map((s) => s.average)).toFixed(1),
  } : null;

  const selectedClassData = classArms.find((c) => String(c.id) === selectedClass);
  const selectedTermData = terms.find((t) => String(t.id) === selectedTerm);

  if (loading) {
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
        <span className="text-gray-800">Class View</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📋</span>
          <div>
            <h1 className="text-2xl font-bold">Class Term Results</h1>
            <p className="text-purple-100">
              View all student results for a class term
            </p>
          </div>
        </div>
      </div>

      <Protected allowed={["ADMIN", "COORDINATOR", "TEACHER"]} userRole={role}>
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Select Class & Term
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select class...</option>
                {classArms.map((classArm) => (
                  <option key={classArm.id} value={classArm.id}>
                    {classArm.classLevel?.name} {classArm.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select term...</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name} {term.session?.name ? `- ${term.session.name}` : term.year ? `- ${term.year}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchResults}
                disabled={fetching || !selectedClass || !selectedTerm}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {fetching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  "View Results"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.studentCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Subjects</p>
              <p className="text-2xl font-bold text-gray-800">{stats.subjectCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Class Average</p>
              <p className="text-2xl font-bold text-purple-600">{stats.classAverage}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Highest Avg</p>
              <p className="text-2xl font-bold text-green-600">{stats.highestAvg}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Lowest Avg</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowestAvg}</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        {groupedResults.length > 0 && (
          <div className="bg-purple-50 rounded-xl p-4 mb-4 flex items-center justify-between">
            <p className="text-purple-800 font-medium">
              <span className="font-bold">
                {selectedClassData?.classLevel?.name} {selectedClassData?.name}
              </span>{" "}
              Results - <span className="font-bold">{selectedTermData?.name}</span>
              {" "}({subjects.length} subjects, {groupedResults.length} students)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport("pdf")}
                disabled={exporting !== null}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {exporting === "pdf" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                )}
                PDF
              </button>
              <button
                onClick={() => handleExport("xlsx")}
                disabled={exporting !== null}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {exporting === "xlsx" ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                )}
                Excel
              </button>
            </div>
          </div>
        )}

        {/* Results Table */}
        {groupedResults.length > 0 ? (
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Subjects
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Average
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groupedResults.map((studentData, index) => {
                    const { grade, color } = getOverallGrade(studentData.average);
                    const studentName = `${studentData.student.surname} ${studentData.student.firstname} ${studentData.student.othername || ""}`.trim();
                    const isExpanded = expandedStudent === studentData.student.id;

                    return (
                      <React.Fragment key={studentData.student.id}>
                        <tr
                          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                            isExpanded ? "bg-purple-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            {index + 1 <= 3 ? (
                              <span className="text-xl">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                              </span>
                            ) : (
                              <span className="text-gray-500 font-medium">{index + 1}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-medium text-gray-800">
                                {studentName}
                              </span>
                              {studentData.student.admissionNo && (
                                <p className="text-xs text-gray-500">
                                  {studentData.student.admissionNo}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {studentData.subjectCount}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-lg">{studentData.totalScore}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-lg">
                              {studentData.average.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${color}`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() =>
                                setExpandedStudent(isExpanded ? null : studentData.student.id)
                              }
                              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                              {isExpanded ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="px-4 py-4 bg-purple-50">
                              <div className="ml-8">
                                <h4 className="font-medium text-gray-800 mb-3">
                                  Subject Breakdown
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {studentData.results
                                    .sort((a, b) => b.total - a.total)
                                    .map((result) => {
                                      const { grade: subGrade, color: subColor } = getGrade(
                                        result.total
                                      );
                                      return (
                                        <div
                                          key={result.subjectId}
                                          className="bg-white p-3 rounded-lg border border-gray-200"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-800">
                                              {result.subjectName}
                                            </span>
                                            <span
                                              className={`px-2 py-0.5 rounded text-xs font-bold ${subColor}`}
                                            >
                                              {subGrade}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-500">
                                              CA: <span className="text-gray-800">{result.continuous}</span>
                                            </span>
                                            <span className="text-gray-500">
                                              Exam: <span className="text-gray-800">{result.summary}</span>
                                            </span>
                                            <span className="text-gray-500">
                                              Total:{" "}
                                              <span className="font-bold text-gray-800">
                                                {result.total}
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : !fetching && selectedClass && selectedTerm ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500">
              No results have been recorded for this class and term.
            </p>
          </div>
        ) : !fetching ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Select Filters
            </h3>
            <p className="text-gray-500">
              Choose a class and term to view all student results.
            </p>
          </div>
        ) : null}

        {/* Back Link */}
        <div className="mt-6">
          <Link
            href="/list/results"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <span>&#8592;</span> Back to Results
          </Link>
        </div>
      </Protected>
    </div>
  );
}
