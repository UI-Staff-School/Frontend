"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ResultTable, { ResultRow } from "@/components/ResultTable";
import Protected from "@/components/Protected";
import styles from "@/styles/Result.module.css";

type Student = {
  id: number;
  matric: string;
  surname: string;
  firstname: string;
  othername?: string;
  className: string;
};

type Subject = {
  id: number;
  name: string;
  maxScore: number;
};

type Term = {
  id: number;
  name: string;
  year: string;
};

export default function DashboardResultsPage() {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

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
          setSubjects(subjectsData.subjects || []);
        }

        if (termsRes.ok) {
          const termsData = await termsRes.json();
          setTerms(termsData.terms || []);
        }

        const resultsRes = await fetch("/api/results");
        if (!resultsRes.ok) throw new Error("Failed to fetch results");
        const resultsData = await resultsRes.json();

        // Ensure results is an array before mapping
        const resultsArray = Array.isArray(resultsData.results)
          ? resultsData.results
          : Array.isArray(resultsData)
          ? resultsData
          : [];

        const mapped = resultsArray.map((x: any) => ({
          id: x.id,
          subjectName: x.subject?.name || x.subjectName || "Unknown",
          continuous: x.continuous || 0,
          summary: x.summary || 0,
          total: x.total || 0,
          comments: x.comments || "",
          studentName: x.student
            ? `${x.student.surname || ""} ${x.student.firstname || ""} ${
                x.student.othername || ""
              }`.trim()
            : x.studentName || "Unknown",
          teacherName: x.teacher?.name || x.teacherName || "Unknown",
        }));
        setRows(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFilter = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStudent) params.append("studentId", selectedStudent);
      if (selectedTerm) params.append("termId", selectedTerm);

      const resultsRes = await fetch(`/api/results?${params.toString()}`);
      if (!resultsRes.ok) throw new Error("Failed to fetch results");
      const resultsData = await resultsRes.json();

      // Ensure results is an array before mapping
      const resultsArray = Array.isArray(resultsData.results)
        ? resultsData.results
        : Array.isArray(resultsData)
        ? resultsData
        : [];

      const mapped = resultsArray.map((x: any) => ({
        id: x.id,
        subjectName: x.subject?.name || x.subjectName || "Unknown",
        continuous: x.continuous || 0,
        summary: x.summary || 0,
        total: x.total || 0,
        comments: x.comments || "",
        studentName: x.student
          ? `${x.student.surname || ""} ${x.student.firstname || ""} ${
              x.student.othername || ""
            }`.trim()
          : x.studentName || "Unknown",
        teacherName: x.teacher?.name || x.teacherName || "Unknown",
      }));
      setRows(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (result: ResultRow) => {
    window.location.href = `/results/edit/${result.id}`;
  };

  const handleDelete = async (result: ResultRow) => {
    if (!confirm("Are you sure you want to delete this result?")) return;

    try {
      const response = await fetch(`/api/results/${result.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete result");
      }

      await handleFilter();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleHeadmasterComment = (result: ResultRow) => {
    window.location.href = `/results/headmaster/${result.id}`;
  };

  if (loading) {
    return <div className={styles.loading}>Loading results...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className={styles.pageHeader}>
        <div className={styles.pageTitleGroup}>
          <span className={styles.headerAccent}>
            <span className={styles.headerAccentDot} />
            Result Management
          </span>
          <h1 className={styles.pageTitle}>Term Results Overview</h1>
          <p className={styles.pageSubtitle}>
            Filter by student and term to review continuous assessment, exams,
            and final scores.
          </p>
        </div>
      </div>

      <Protected allowed={["ADMIN", "COORDINATOR", "TEACHER"]} userRole={role}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <h3>{rows.length}</h3>
              <p>Total results in view</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <h3>{students.length}</h3>
              <p>Students with records</p>
            </div>
          </div>
          {(role === "ADMIN" ||
            role === "COORDINATOR" ||
            role === "TEACHER") && (
            <>
              <Link
                href="/results/add/multi"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                <div>
                  <p className="font-semibold">Multi-Subject Entry</p>
                  <p className="text-xs text-green-100">
                    Enter all subjects at once
                  </p>
                </div>
              </Link>
              <Link
                href="/list/results/subject"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
              >
                <div>
                  <p className="font-semibold">Subject View</p>
                  <p className="text-xs text-blue-100">Results by subject</p>
                </div>
              </Link>
              <Link
                href="/list/results/class"
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <div>
                  <p className="font-semibold">Class View</p>
                  <p className="text-xs text-purple-100">
                    All results by class
                  </p>
                </div>
              </Link>
            </>
          )}
          <Link
            href="/list/results/rankings"
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg"
          >
            <div>
              <p className="font-semibold">Class Rankings</p>
              <p className="text-xs text-indigo-100">View student rankings</p>
            </div>
          </Link>
        </div>

        <div className={styles.filters}>
          <div className={styles.filtersGroup}>
            <span className={styles.filtersLabel}>Student</span>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.surname} {student.firstname} - {student.className}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filtersGroup}>
            <span className={styles.filtersLabel}>Term</span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            >
              <option value="">All Terms</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.name} - {term.year}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filtersGroup}>
            <span className={styles.filtersLabel}>Actions</span>
            <button
              className={styles.button}
              onClick={handleFilter}
              disabled={loading}
            >
              Apply Filters
            </button>
          </div>
        </div>

        <ResultTable
          rows={rows}
          showStudent={
            role === "ADMIN" || role === "COORDINATOR" || role === "TEACHER"
          }
          showTeacher={
            role === "ADMIN" || role === "COORDINATOR" || role === "TEACHER"
          }
          canEdit={
            role === "ADMIN" || role === "COORDINATOR" || role === "TEACHER"
          }
          canAddHeadmasterComment={role === "ADMIN"}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHeadmasterComment={handleHeadmasterComment}
        />
      </Protected>
    </div>
  );
}
