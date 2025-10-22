import React from "react";
import styles from "@/styles/Result.module.css";

export type ResultRow = {
  id: number;
  subjectName: string;
  continuous: number;
  summary: number;
  total: number;
  comments?: string;
  studentName?: string;
  teacherName?: string;
};

interface ResultTableProps {
  rows: ResultRow[];
  showStudent?: boolean;
  showTeacher?: boolean;
  onEdit?: (result: ResultRow) => void;
  onDelete?: (result: ResultRow) => void;
  onHeadmasterComment?: (result: ResultRow) => void;
  canEdit?: boolean;
  canAddHeadmasterComment?: boolean;
}

export default function ResultTable({
  rows,
  showStudent = false,
  showTeacher = false,
  onEdit,
  onDelete,
  onHeadmasterComment,
  canEdit = false,
  canAddHeadmasterComment = false,
}: ResultTableProps) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            {showStudent && <th>Student</th>}
            <th>Subject</th>
            <th>CA (30)</th>
            <th>Exam (70)</th>
            <th>Total (100)</th>
            <th>Comments</th>
            {showTeacher && <th>Teacher</th>}
            {canEdit && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {showStudent && <td>{r.studentName}</td>}
              <td>{r.subjectName}</td>
              <td>{r.continuous}</td>
              <td>{r.summary}</td>
              <td>{r.total}</td>
              <td>{r.comments || "-"}</td>
              {showTeacher && <td>{r.teacherName || "-"}</td>}
              {(canEdit || canAddHeadmasterComment) && (
                <td>
                  <div className={styles.actions}>
                    {onEdit && canEdit && (
                      <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={() => onEdit(r)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && canEdit && (
                      <button
                        className={`${styles.button} ${styles.buttonDanger}`}
                        onClick={() => onDelete(r)}
                      >
                        Delete
                      </button>
                    )}
                    {onHeadmasterComment && canAddHeadmasterComment && (
                      <button
                        className={styles.button}
                        onClick={() => onHeadmasterComment(r)}
                      >
                        Headmaster Comment
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className={styles.loading}>No results found.</div>
      )}
    </div>
  );
}
