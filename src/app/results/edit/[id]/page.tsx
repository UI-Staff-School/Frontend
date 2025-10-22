"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

type Result = {
  id: number;
  studentId: number;
  subjectId: number;
  termId: number;
  continuous: number;
  summary: number;
  total: number;
  comments?: string;
  student: Student;
  subject: Subject;
  term: Term;
};

export default function EditResultPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params.id as string;

  const [role, setRole] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<Result | null>(null);
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

        const resultRes = await fetch(`/api/results/${resultId}`);
        if (!resultRes.ok) throw new Error("Failed to fetch result");
        const resultData = await resultRes.json();
        setResult(resultData.result);

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
  }, [resultId]);

  const handleSave = async (data: any) => {
    try {
      const response = await fetch(`/api/results/${resultId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update result");
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

  if (!result) {
    return <div className={styles.error}>Result not found</div>;
  }

  return (
    <div className={styles.container}>
      <Protected allowed={["ADMIN", "TEACHER"]} userRole={role}>
        <ResultForm
          initial={result}
          onSave={handleSave}
          onCancel={handleCancel}
          students={students}
          subjects={subjects}
          terms={terms}
          isEditing={true}
        />
      </Protected>
    </div>
  );
}
