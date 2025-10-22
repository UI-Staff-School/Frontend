"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import HeadmasterCommentForm from "@/components/HeadmasterCommentForm";
import Protected from "@/components/Protected";
import styles from "@/styles/Result.module.css";

type Result = {
  id: number;
  studentId: number;
  subjectId: number;
  termId: number;
  continuous: number;
  summary: number;
  total: number;
  comments?: string;
  student: {
    surname: string;
    firstname: string;
    othername?: string;
    className: string;
  };
  subject: {
    name: string;
  };
  term: {
    name: string;
    year: string;
  };
};

export default function HeadmasterCommentPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params.id as string;

  const [role, setRole] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<Result | null>(null);
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [resultId]);

  const handleSave = async (comment: string) => {
    try {
      const response = await fetch(`/api/results/${resultId}/headmaster`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ headmasterComment: comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update headmaster comment"
        );
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
      <Protected allowed={["ADMIN"]} userRole={role}>
        <div className={styles.card}>
          <h3>Result Details</h3>
          <p>
            <strong>Student:</strong> {result.student.surname} {""}
            {result.student.firstname} {result.student.othername || ""}
          </p>
          <p>
            <strong>Class:</strong> {result.student.className}
          </p>
          <p>
            <strong>Subject:</strong> {result.subject.name}
          </p>
          <p>
            <strong>Term:</strong> {result.term.name} - {result.term.year}
          </p>
          <p>
            <strong>CA:</strong> {result.continuous}/30
          </p>
          <p>
            <strong>Exam:</strong> {result.summary}/70
          </p>
          <p>
            <strong>Total:</strong> {result.total}/100
          </p>
        </div>

        <HeadmasterCommentForm
          resultId={result.id}
          initialComment={result.comments || ""}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Protected>
    </div>
  );
}
