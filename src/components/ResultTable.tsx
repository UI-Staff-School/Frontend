import React from "react";
import FormModal from "./FormModal";
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
  const scoreBadgeClass = (total: number) =>
    total >= 70 ? styles.totalBadge : `${styles.totalBadge} ${styles.totalBadgeLow}`;

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableScroll}>
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
              {(canEdit || canAddHeadmasterComment) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {showStudent && <td>{r.studentName}</td>}
                <td>{r.subjectName}</td>
                <td className={styles.scoreCell}>
                  {r.continuous}
                  <span className={styles.scoreMuted}> / 30</span>
                </td>
                <td className={styles.scoreCell}>
                  {r.summary}
                  <span className={styles.scoreMuted}> / 70</span>
                </td>
                <td>
                  <span className={scoreBadgeClass(r.total)}>
                    {r.total}
                    <span className={styles.scoreMuted}> / 100</span>
                  </span>
                </td>
                <td>
                  <span className={styles.commentText}>
                    {r.comments && r.comments.trim().length > 0 ? r.comments : "-"}
                  </span>
                </td>
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
                      {canEdit && (
                        <FormModal table="result" type="delete" id={r.id} />
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
      </div>
      {rows.length === 0 && (
        <div className={styles.tableEmpty}>No results found yet. Adjust filters or add a new result.</div>
      )}
    </div>
  );
}
