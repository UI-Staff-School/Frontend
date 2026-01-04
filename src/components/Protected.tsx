import React from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Result.module.css";

type Props = {
  allowed: ("ADMIN" | "COORDINATOR" | "TEACHER" | "STUDENT" | "PARENT")[];
  children: React.ReactNode;
  userRole?: string;
};

export default function Protected({ allowed, children, userRole }: Props) {
  // userRole should come from your client-side auth context / fetch to /api/auth/me
  if (!userRole) {
    // you can display loader and fetch role
    return <div className={styles.loading}>Loading...</div>;
  }

  // Normalize role to uppercase for comparison
  const normalizedRole = userRole.toUpperCase();

  if (!allowed.includes(normalizedRole as any)) {
    return (
      <div className={styles.notAuthorized}>
        You do not have permission to view this page.
      </div>
    );
  }
  return <>{children}</>;
}

