import React, { useState } from "react";
import styles from "@/styles/Result.module.css";

type Props = {
  resultId: number;
  initialComment?: string;
  onSave: (comment: string) => Promise<void>;
  onCancel?: () => void;
};

export default function HeadmasterCommentForm({
  resultId,
  initialComment = "",
  onSave,
  onCancel,
}: Props) {
  const [comment, setComment] = useState(initialComment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSave(comment);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div>
        <h2 className={styles.formTitle}>Add Headmaster Comment</h2>
        <p className={styles.formSubtitle}>
          Share a concise summary of the student&apos;s performance for this term.
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label>Headmaster Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Enter headmaster comment..."
          required
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Saving..." : "Save Comment"}
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

