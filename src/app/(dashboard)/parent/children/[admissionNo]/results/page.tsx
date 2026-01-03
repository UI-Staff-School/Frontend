"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Result {
  id: string;
  subject: {
    subjectName: string;
  };
  caScore: number;
  examScore: number;
  totalScore: number;
  grade?: string;
  term?: {
    name: string;
    session?: {
      name: string;
    };
  };
}

interface Child {
  admissionNo: string;
  firstName: string;
  lastName: string;
}

const ChildResultsPage = () => {
  const params = useParams();
  const admissionNo = params.admissionNo as string;

  const [results, setResults] = useState<Result[]>([]);
  const [childInfo, setChildInfo] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch child info and results
        const [childrenResponse, resultsResponse] = await Promise.all([
          fetch("/api/parent/portal/children", { credentials: "include" }),
          fetch(`/api/parent/portal/children/${admissionNo}/results`, {
            credentials: "include",
          }),
        ]);

        if (childrenResponse.ok) {
          const children = await childrenResponse.json();
          const child = Array.isArray(children)
            ? children.find((c: Child) => c.admissionNo === admissionNo)
            : null;
          setChildInfo(child);
        }

        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          setResults(Array.isArray(resultsData) ? resultsData : []);
        } else {
          throw new Error("Failed to fetch results");
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    if (admissionNo) {
      fetchData();
    }
  }, [admissionNo]);

  const getGradeColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 50) return "text-yellow-600 bg-yellow-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getGrade = (score: number) => {
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 40) return "D";
    return "F";
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl m-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl m-4">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-semibold">Error loading results</p>
          <p className="text-sm">{error}</p>
          <Link
            href="/parent/children"
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Back to Children
          </Link>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalScores = results.map((r) => r.totalScore);
  const averageScore =
    totalScores.length > 0
      ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
      : 0;
  const highestScore = totalScores.length > 0 ? Math.max(...totalScores) : 0;
  const lowestScore = totalScores.length > 0 ? Math.min(...totalScores) : 0;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-2 text-purple-100 mb-2">
          <Link href="/parent/children" className="hover:text-white">
            My Children
          </Link>
          <span>/</span>
          <span>{childInfo?.firstName} {childInfo?.lastName}</span>
          <span>/</span>
          <span>Results</span>
        </div>
        <h1 className="text-2xl font-bold">
          {childInfo?.firstName} {childInfo?.lastName}&apos;s Results
        </h1>
        <p className="text-purple-100 mt-1">{admissionNo}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{results.length}</p>
          <p className="text-sm text-gray-500">Subjects</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{averageScore}%</p>
          <p className="text-sm text-gray-500">Average</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{highestScore}%</p>
          <p className="text-sm text-gray-500">Highest</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{lowestScore}%</p>
          <p className="text-sm text-gray-500">Lowest</p>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Results Yet
          </h2>
          <p className="text-gray-500">
            Results will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Subject
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  CA (30)
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Exam (70)
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Total (100)
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">
                      {result.subject?.subjectName || "Unknown Subject"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {result.caScore}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {result.examScore}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-gray-800">
                      {result.totalScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full font-semibold text-sm ${getGradeColor(
                        result.totalScore
                      )}`}
                    >
                      {result.grade || getGrade(result.totalScore)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <Link
          href="/parent/children"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span>←</span> Back to My Children
        </Link>
      </div>
    </div>
  );
};

export default ChildResultsPage;
