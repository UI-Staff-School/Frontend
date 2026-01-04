"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Result {
  id: string | number;
  testScore?: number;
  examScore?: number;
  totalScore?: number;
  grade?: string;
  remark?: string;
  subject?: {
    id: string | number;
    name: string;
  };
  term?: {
    id: string | number;
    name: string;
  };
}

interface Student {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  classArm?: {
    id: string | number;
    name: string;
    classLevel?: {
      id: string | number;
      name: string;
    };
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

const StudentResultsPage = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentRes, termsRes] = await Promise.all([
        fetch("/api/student/me", { credentials: "include" }),
        fetch("/api/terms", { credentials: "include" }),
      ]);

      if (!studentRes.ok) {
        const errorData = await studentRes.json();
        setError(errorData.error || "Failed to load profile");
        return;
      }

      const studentData = await studentRes.json();
      setStudent(studentData);

      if (termsRes.ok) {
        const termsData = await termsRes.json();
        const termsList = termsData?.terms || [];
        setTerms(termsList);

        // Find active term
        const activeTerm = termsList.find((t: Term) => t.isActive);
        if (activeTerm) {
          setSelectedTerm(String(activeTerm.id));
          await fetchResults(studentData.id, String(activeTerm.id));
        }
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (studentId: string | number, termId: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/attendance/student/${studentId}/term/${termId}`.replace("attendance", "results"),
        { credentials: "include" }
      );

      // Actually use the result endpoint
      const resultRes = await fetch(
        `/api/results?studentId=${studentId}&termId=${termId}`,
        { credentials: "include" }
      );

      if (resultRes.ok) {
        const data = await resultRes.json();
        const resultList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setResults(resultList);
      } else {
        setResults([]);
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId);
    if (student && termId) {
      fetchResults(student.id, termId);
    }
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    if (!student || !selectedTerm || results.length === 0) return;

    try {
      setExporting(format);
      const selectedTermObj = terms.find((t) => String(t.id) === selectedTerm);
      const response = await fetch(
        `/api/export/result/student/${student.id}/term/${selectedTerm}?format=${format}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to export results");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `results-${student.admissionNo}-${selectedTermObj?.name || "term"}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Export error:", err);
      setError(err.message || "Failed to export results");
    } finally {
      setExporting(null);
    }
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

  // Calculate statistics
  const totalScore = results.reduce((sum, r) => sum + (r.totalScore || 0), 0);
  const averageScore = results.length > 0 ? totalScore / results.length : 0;
  const highestScore = results.length > 0
    ? Math.max(...results.map((r) => r.totalScore || 0))
    : 0;
  const lowestScore = results.length > 0
    ? Math.min(...results.map((r) => r.totalScore || 0))
    : 0;

  if (loading && !student) {
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
            Unable to Load Results
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link
            href="/student"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/student" className="hover:text-gray-700">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-800">My Results</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold">My Academic Results</h1>
        <p className="text-green-100 mt-1">
          {student?.firstName} {student?.lastName} - {student?.admissionNo}
        </p>
        {student?.classArm && (
          <p className="text-green-100 text-sm">
            {student.classArm.classLevel?.name} {student.classArm.name}
          </p>
        )}
      </div>

      {/* Term Selector */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Select Term:
          </label>
          <select
            value={selectedTerm}
            onChange={(e) => handleTermChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select a term</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
                {term.session ? ` (${term.session.name})` : ""}
                {term.isActive ? " - Current" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {results.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {results.length}
              </p>
              <p className="text-sm text-gray-500">Subjects</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {averageScore.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">Average Score</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{highestScore}</p>
              <p className="text-sm text-gray-500">Highest Score</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{lowestScore}</p>
              <p className="text-sm text-gray-500">Lowest Score</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center justify-end gap-3 mb-6">
            <span className="text-sm text-gray-500">Export:</span>
            <button
              onClick={() => handleExport("pdf")}
              disabled={exporting !== null}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {exporting === "pdf" ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {exporting === "xlsx" ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
              )}
              Excel
            </button>
          </div>
        </>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : !selectedTerm ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <p className="font-medium">Select a Term</p>
            <p className="text-sm mt-1">Choose a term to view your results</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <p className="font-medium">No Results Found</p>
            <p className="text-sm mt-1">
              No results available for the selected term
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">
                    Subject
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Test
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Exam
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Total
                  </th>
                  <th className="text-center p-4 font-medium text-gray-600">
                    Grade
                  </th>
                  <th className="text-left p-4 font-medium text-gray-600 hidden md:table-cell">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr
                    key={result.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <span className="font-medium text-gray-800">
                        {result.subject?.name || "Unknown Subject"}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {result.testScore ?? "-"}
                    </td>
                    <td className="p-4 text-center text-gray-600">
                      {result.examScore ?? "-"}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-gray-800">
                        {result.totalScore ?? "-"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(
                          result.grade
                        )}`}
                      >
                        {result.grade || "-"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 hidden md:table-cell">
                      {result.remark || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="p-4 font-semibold text-gray-800">Total</td>
                  <td className="p-4 text-center font-medium text-gray-600">
                    {results.reduce((sum, r) => sum + (r.testScore || 0), 0)}
                  </td>
                  <td className="p-4 text-center font-medium text-gray-600">
                    {results.reduce((sum, r) => sum + (r.examScore || 0), 0)}
                  </td>
                  <td className="p-4 text-center font-bold text-green-600">
                    {totalScore}
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4 hidden md:table-cell"></td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-gray-800">Average</td>
                  <td colSpan={2}></td>
                  <td className="p-4 text-center font-bold text-indigo-600">
                    {averageScore.toFixed(1)}
                  </td>
                  <td className="p-4"></td>
                  <td className="p-4 hidden md:table-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href="/student"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span>&#8592;</span> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default StudentResultsPage;
