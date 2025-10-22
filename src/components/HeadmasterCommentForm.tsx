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
      <h2>Add Headmaster Comment</h2>

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

