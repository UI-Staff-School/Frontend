import React from "react";
import Link from "next/link";
import styles from "@/styles/Result.module.css";

interface ResultNavigationProps {
  userRole?: string;
  currentPage?: string;
}

export default function ResultNavigation({
  userRole,
  currentPage,
}: ResultNavigationProps) {
  const canEdit = userRole === "ADMIN" || userRole === "TEACHER";
  const canAddHeadmasterComment = userRole === "ADMIN";

  return (
    <nav className={styles.actions}>
      <Link href="/results" className={styles.button}>
        View Results
      </Link>

      {canEdit && (
        <Link href="/results/add" className={styles.button}>
          Add Result
        </Link>
      )}

      {canAddHeadmasterComment && (
        <Link
          href="/auth-test"
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          Test Login
        </Link>
      )}
    </nav>
  );
}
