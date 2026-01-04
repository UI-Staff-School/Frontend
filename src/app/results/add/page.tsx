"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResultForm from "@/components/ResultForm";
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

export default function AddResultPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | undefined>(undefined);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async (data: any) => {
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create result");
      }

      router.push("/results");
    } catch (err: any) {
      throw err;
    }
  };

  const handleCancel = () => {
    router.push("/results");
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div className={styles.pageTitleGroup}>
            <span className={styles.headerAccent}>
              <span className={styles.headerAccentDot} />
              Create Result
            </span>
            <h1 className={styles.pageTitle}>Add New Student Result</h1>
            <p className={styles.pageSubtitle}>
              Capture a student&apos;s continuous assessment and exam scores for a specific term.
            </p>
          </div>
        </div>

        <Protected allowed={["ADMIN", "COORDINATOR", "TEACHER"]} userRole={role}>
          <ResultForm
            onSave={handleSave}
            onCancel={handleCancel}
            students={students}
            subjects={subjects}
            terms={terms}
            isEditing={false}
          />
        </Protected>
      </div>
    </div>
  );
}
