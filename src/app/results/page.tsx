"use client";
import React, { useEffect, useState } from "react";
import ResultTable, { ResultRow } from "@/components/ResultTable";
import Protected from "@/components/Protected";
import ResultNavigation from "@/components/ResultNavigation";
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

export default function ResultsPage() {
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

        const mapped = resultsData.results.map((x: any) => ({
          id: x.id,
          subjectName: x.subject.name,
          continuous: x.continuous,
          summary: x.summary,
          total: x.total,
          comments: x.comments,
          studentName: `${x.student.surname} ${x.student.firstname} ${
            x.student.othername || ""
          }`.trim(),
          teacherName: x.teacher?.name || "Unknown",
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

      const mapped = resultsData.results.map((x: any) => ({
        id: x.id,
        subjectName: x.subject.name,
        continuous: x.continuous,
        summary: x.summary,
        total: x.total,
        comments: x.comments,
        studentName: `${x.student.surname} ${x.student.firstname} ${
          x.student.othername || ""
        }`.trim(),
        teacherName: x.teacher?.name || "Unknown",
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

  // Delete is now handled by FormModal in ResultTable component

  const handleHeadmasterComment = (result: ResultRow) => {
    window.location.href = `/results/headmaster/${result.id}`;
  };

  if (loading) {
    return <div className={styles.loading}>Loading results...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.pageTitleGroup}>
            <span className={styles.headerAccent}>
              <span className={styles.headerAccentDot} />
              Result Management
            </span>
            <h1 className={styles.pageTitle}>Term Results Overview</h1>
            <p className={styles.pageSubtitle}>
              Filter by student and term to review continuous assessment, exams, and final scores.
            </p>
          </div>
          <ResultNavigation userRole={role} currentPage="results" />
        </div>

        <Protected allowed={["ADMIN", "TEACHER", "STUDENT"]} userRole={role}>
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
            showStudent={role === "ADMIN" || role === "TEACHER"}
            showTeacher={role === "ADMIN" || role === "TEACHER"}
            canEdit={role === "ADMIN" || role === "TEACHER"}
            canAddHeadmasterComment={role === "ADMIN"}
            onEdit={handleEdit}
            onHeadmasterComment={handleHeadmasterComment}
          />
        </Protected>
      </div>
    </div>
  );
}
