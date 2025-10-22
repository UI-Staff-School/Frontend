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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Results Management</h1>
        <ResultNavigation userRole={role} currentPage="results" />
      </div>

      <Protected allowed={["ADMIN", "TEACHER", "STUDENT"]} userRole={role}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.filters}>
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

          <button
            className={styles.button}
            onClick={handleFilter}
            disabled={loading}
          >
            Filter Results
          </button>
        </div>

        <ResultTable
          rows={rows}
          showStudent={role === "ADMIN" || role === "TEACHER"}
          showTeacher={role === "ADMIN" || role === "TEACHER"}
          canEdit={role === "ADMIN" || role === "TEACHER"}
          canAddHeadmasterComment={role === "ADMIN"}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHeadmasterComment={handleHeadmasterComment}
        />
      </Protected>
    </div>
  );
}
