"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Protected from "@/components/Protected";

type Subject = {
  id: number;
  name: string;
};

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

type StudentResult = {
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
};

export default function SubjectResultsPage() {
  const [role, setRole] = useState<string | undefined>(undefined);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setRole(userData.user?.role);

        const [subjectsRes, classArmsRes, termsRes] = await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/class/arms"),
          fetch("/api/terms"),
        ]);

        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setSubjects(data.subjects || data || []);
        }

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
    if (!selectedSubject || !selectedClass || !selectedTerm) {
      setError("Please select subject, class, and term");
      return;
    }

    try {
      setFetching(true);
      setError("");
      setResults([]);

      const res = await fetch(
        `/api/results/subject/${selectedSubject}/class/${selectedClass}/term/${selectedTerm}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to fetch results");
      }

      const resultList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setResults(resultList);
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

  const getRemark = (total: number) => {
    if (total >= 70) return "Excellent";
    if (total >= 60) return "Very Good";
    if (total >= 50) return "Good";
    if (total >= 40) return "Fair";
    return "Poor";
  };

  // Calculate statistics
  const stats = results.length > 0 ? {
    count: results.length,
    average: (results.reduce((sum, r) => sum + r.total, 0) / results.length).toFixed(1),
    highest: Math.max(...results.map((r) => r.total)),
    lowest: Math.min(...results.map((r) => r.total)),
    passed: results.filter((r) => r.total >= 40).length,
    failed: results.filter((r) => r.total < 40).length,
  } : null;

  const selectedSubjectData = subjects.find((s) => String(s.id) === selectedSubject);
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
        <span className="text-gray-800">Subject View</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold">Subject Results View</h1>
            <p className="text-blue-100">
              View all student results for a specific subject
            </p>
          </div>
        </div>
      </div>

      <Protected allowed={["ADMIN", "TEACHER"]} userRole={role}>
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Select Subject, Class & Term
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select subject...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                disabled={fetching || !selectedSubject || !selectedClass || !selectedTerm}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.count}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Average</p>
              <p className="text-2xl font-bold text-blue-600">{stats.average}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Highest</p>
              <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Lowest</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Passed</p>
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        {results.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="text-blue-800 font-medium">
              <span className="font-bold">{selectedSubjectData?.name}</span> Results for{" "}
              <span className="font-bold">
                {selectedClassData?.classLevel?.name} {selectedClassData?.name}
              </span>{" "}
              - <span className="font-bold">{selectedTermData?.name}</span>
            </p>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 ? (
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Admission No
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      CA (30)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Exam (70)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Total (100)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results
                    .sort((a, b) => b.total - a.total)
                    .map((result, index) => {
                      const { grade, color } = getGrade(result.total);
                      const remark = getRemark(result.total);
                      const studentName = `${result.student.surname} ${result.student.firstname} ${result.student.othername || ""}`.trim();

                      return (
                        <tr
                          key={result.id}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-800">
                              {studentName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {result.student.admissionNo || "-"}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {result.continuous}
                          </td>
                          <td className="px-4 py-3 text-center font-medium">
                            {result.summary}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-lg">{result.total}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${color}`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {remark}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        ) : !fetching && selectedSubject && selectedClass && selectedTerm ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-500">
              No results have been recorded for this subject, class, and term combination.
            </p>
          </div>
        ) : !fetching ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Select Filters
            </h3>
            <p className="text-gray-500">
              Choose a subject, class, and term to view student results.
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
