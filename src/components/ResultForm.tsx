import React, { useState } from "react";
import styles from "@/styles/Result.module.css";

type Student = {
  id: number;
  admissionNo?: string;
  matric?: string;
  surname: string;
  firstname: string;
  othername?: string;
  className?: string;
  classArmId?: number;
  classArm?: {
    id: number;
    name: string;
  };
};

type Subject = {
  id: number;
  name: string;
  maxScore?: number;
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
  const [testScore, setTestScore] = useState(initial?.testScore ?? initial?.continuous ?? 0);
  const [examScore, setExamScore] = useState(initial?.examScore ?? initial?.summary ?? 0);
  const [remark, setRemark] = useState(initial?.remark ?? initial?.comments ?? "");
  const [studentId, setStudentId] = useState(initial?.studentId ?? "");
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? "");
  const [termId, setTermId] = useState(initial?.termId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = Number(testScore) + Number(examScore);

  // Get the selected student to extract classArmId
  const selectedStudent = students.find(
    (s) => String(s.admissionNo || s.matric || s.id) === String(studentId)
  );
  const classArmId = selectedStudent?.classArmId || selectedStudent?.classArm?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validation
      if (!studentId || !subjectId || !termId) {
        throw new Error("Please fill in all required fields");
      }
      if (testScore < 0 || testScore > 40) {
        throw new Error("Test/CA score must be between 0 and 40");
      }
      if (examScore < 0 || examScore > 60) {
        throw new Error("Exam score must be between 0 and 60");
      }
      if (!classArmId) {
        throw new Error("Could not determine student's class. Please try again.");
      }
      if (!remark.trim()) {
        throw new Error("Remark is required");
      }

      await onSave({
        studentId: String(studentId),
        subjectId: Number(subjectId),
        termId: Number(termId),
        classArmId: Number(classArmId),
        testScore: Number(testScore),
        examScore: Number(examScore),
        remark: remark.trim(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div>
        <h2 className={styles.formTitle}>
          {isEditing ? "Edit Result" : "Add New Result"}
        </h2>
        <p className={styles.formSubtitle}>
          Enter test and exam scores. We will calculate the total for you.
        </p>
      </div>

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
          {students.map((student) => {
            const id = student.admissionNo || student.matric || String(student.id);
            return (
              <option key={student.id} value={id}>
                {student.surname} {student.firstname} {student.othername || ""} -{" "}
                {student.className || student.classArm?.name || "N/A"}
              </option>
            );
          })}
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
              {term.name} {term.session?.name ? `- ${term.session.name}` : term.year ? `- ${term.year}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Test/CA Score (max 40) *</label>
        <span className={styles.fieldHint}>
          Continuous assessment score for this subject (0-40).
        </span>
        <input
          type="number"
          min="0"
          max="40"
          value={testScore}
          onChange={(e) => setTestScore(e.target.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Exam Score (max 60) *</label>
        <span className={styles.fieldHint}>
          Final exam score for this subject (0-60).
        </span>
        <input
          type="number"
          min="0"
          max="60"
          value={examScore}
          onChange={(e) => setExamScore(e.target.value)}
          required
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
        <label>Remark *</label>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={3}
          placeholder="Enter remark (e.g., Excellent, Good, Needs improvement)..."
          required
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
