"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Protected from "@/components/Protected";

type Student = {
  id: number;
  matric: string;
  surname: string;
  firstname: string;
  othername?: string;
  className: string;
  classArmId?: number;
};

type Subject = {
  id: number;
  name: string;
  maxScore?: number;
};

type Term = {
  id: number;
  name: string;
  year: string;
};

type SubjectScore = {
  subjectId: number;
  subjectName: string;
  continuous: number | string;
  summary: number | string;
  comments: string;
};

export default function MultiSubjectResultPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | undefined>(undefined);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [scores, setScores] = useState<SubjectScore[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setRole(userData.user?.role);

        const [studentsRes, subjectsRes, termsRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/subjects"),
          fetch("/api/terms"),
        ]);

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData.students || []);
        }

        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          const subjectList = subjectsData.subjects || [];
          setSubjects(subjectList);
          // Initialize scores for all subjects
          setScores(
            subjectList.map((s: Subject) => ({
              subjectId: s.id,
              subjectName: s.name,
              continuous: "",
              summary: "",
              comments: "",
            }))
          );
        }

        if (termsRes.ok) {
          const termsData = await termsRes.json();
          setTerms(termsData.terms || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const updateScore = (
    subjectId: number,
    field: "continuous" | "summary" | "comments",
    value: string | number
  ) => {
    setScores((prev) =>
      prev.map((s) =>
        s.subjectId === subjectId ? { ...s, [field]: value } : s
      )
    );
  };

  const getTotal = (continuous: number | string, summary: number | string) => {
    const c = Number(continuous) || 0;
    const s = Number(summary) || 0;
    return c + s;
  };

  const getGrade = (total: number) => {
    if (total >= 70) return { grade: "A", color: "text-green-600" };
    if (total >= 60) return { grade: "B", color: "text-blue-600" };
    if (total >= 50) return { grade: "C", color: "text-yellow-600" };
    if (total >= 40) return { grade: "D", color: "text-orange-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedStudent || !selectedTerm) {
      setError("Please select a student and term");
      return;
    }

    // Filter out subjects with no scores entered
    const filledScores = scores.filter(
      (s) => s.continuous !== "" || s.summary !== ""
    );

    if (filledScores.length === 0) {
      setError("Please enter scores for at least one subject");
      return;
    }

    // Validate scores
    for (const score of filledScores) {
      const ca = Number(score.continuous) || 0;
      const exam = Number(score.summary) || 0;
      if (ca < 0 || ca > 30) {
        setError(`CA score for ${score.subjectName} must be between 0 and 30`);
        return;
      }
      if (exam < 0 || exam > 70) {
        setError(`Exam score for ${score.subjectName} must be between 0 and 70`);
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        studentId: Number(selectedStudent),
        termId: Number(selectedTerm),
        results: filledScores.map((s) => ({
          subjectId: s.subjectId,
          continuous: Number(s.continuous) || 0,
          summary: Number(s.summary) || 0,
          comments: s.comments || "",
        })),
      };

      const response = await fetch("/api/results/multi-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to save results");
      }

      setSuccess(`Successfully saved ${filledScores.length} subject results!`);

      // Reset scores after successful save
      setScores(
        subjects.map((s) => ({
          subjectId: s.id,
          subjectName: s.name,
          continuous: "",
          summary: "",
          comments: "",
        }))
      );

      // Redirect after short delay
      setTimeout(() => {
        router.push("/list/results");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to save results");
    } finally {
      setSubmitting(false);
    }
  };

  const filledCount = scores.filter(
    (s) => s.continuous !== "" || s.summary !== ""
  ).length;

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
        <span className="text-gray-800">Multi-Subject Entry</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📝</span>
          <div>
            <h1 className="text-2xl font-bold">Multi-Subject Result Entry</h1>
            <p className="text-indigo-100">
              Enter results for multiple subjects at once
            </p>
          </div>
        </div>
      </div>

      <Protected allowed={["ADMIN", "TEACHER"]} userRole={role}>
        <form onSubmit={handleSubmit}>
          {/* Student & Term Selection */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Select Student & Term
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student *
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.surname} {student.firstname} {student.othername || ""} - {student.className}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term *
                </label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a term...</option>
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name} - {term.year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Subject Scores Table */}
          <div className="bg-white rounded-xl overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Subject Scores
              </h2>
              <span className="text-sm text-gray-500">
                {filledCount} of {subjects.length} subjects filled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-28">
                      CA (0-30)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-28">
                      Exam (0-70)
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-20">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-16">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scores.map((score, index) => {
                    const total = getTotal(score.continuous, score.summary);
                    const { grade, color } = getGrade(total);
                    const hasValue = score.continuous !== "" || score.summary !== "";

                    return (
                      <tr
                        key={score.subjectId}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } ${hasValue ? "bg-indigo-50" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-800">
                            {score.subjectName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={score.continuous}
                            onChange={(e) =>
                              updateScore(score.subjectId, "continuous", e.target.value)
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            max="70"
                            value={score.summary}
                            onChange={(e) =>
                              updateScore(score.subjectId, "summary", e.target.value)
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-gray-800">
                            {hasValue ? total : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold ${hasValue ? color : "text-gray-400"}`}>
                            {hasValue ? grade : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={score.comments}
                            onChange={(e) =>
                              updateScore(score.subjectId, "comments", e.target.value)
                            }
                            placeholder="Optional..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/list/results"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || filledCount === 0}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  Save {filledCount} Result{filledCount !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </form>
      </Protected>
    </div>
  );
}
