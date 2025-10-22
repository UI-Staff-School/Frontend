import React, { useState, useEffect } from "react";
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

type Props = {
  initial?: any;
  onSave: (data: any) => Promise<void>;
  onCancel?: () => void;
  students?: Student[];
  subjects?: Subject[];
  terms?: Term[];
  isEditing?: boolean;
};

export default function ResultForm({
  initial,
  onSave,
  onCancel,
  students = [],
  subjects = [],
  terms = [],
  isEditing = false,
}: Props) {
  const [continuous, setContinuous] = useState(initial?.continuous ?? 0);
  const [summary, setSummary] = useState(initial?.summary ?? 0);
  const [comments, setComments] = useState(initial?.comments ?? "");
  const [studentId, setStudentId] = useState(initial?.studentId ?? "");
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? "");
  const [termId, setTermId] = useState(initial?.termId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = Number(continuous) + Number(summary);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validation
      if (!studentId || !subjectId || !termId) {
        throw new Error("Please fill in all required fields");
      }
      if (continuous < 0 || continuous > 30) {
        throw new Error("CA score must be between 0 and 30");
      }
      if (summary < 0 || summary > 70) {
        throw new Error("Exam score must be between 0 and 70");
      }

      await onSave({
        studentId: Number(studentId),
        subjectId: Number(subjectId),
        termId: Number(termId),
        continuous: Number(continuous),
        summary: Number(summary),
        comments,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{isEditing ? "Edit Result" : "Add New Result"}</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label>Student *</label>
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          disabled={isEditing}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.surname} {student.firstname} {student.othername} -{" "}
              {student.className}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Subject *</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
        >
          <option value="">Select a subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Term *</label>
        <select
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
          required
        >
          <option value="">Select a term</option>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name} - {term.year}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>CA Score (max 30)</label>
        <input
          type="number"
          min="0"
          max="30"
          value={continuous}
          onChange={(e) => setContinuous(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Exam Score (max 70)</label>
        <input
          type="number"
          min="0"
          max="70"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Total Score</label>
        <input
          type="number"
          value={total}
          disabled
          style={{ background: "#f9fafb" }}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Comments</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          placeholder="Optional comments..."
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Result" : "Save Result"}
        </button>
        {onCancel && (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

