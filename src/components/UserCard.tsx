"use client";

import { useState, useEffect, useCallback } from "react";

interface UserCardProps {
  type: "student" | "teacher" | "parent" | "staff" | "alumni";
}

interface Analytics {
  counts: {
    students: number;
    teachers: number;
    parents: number;
    staff: number;
    alumni: number;
  };
  activeSession?: {
    name: string;
  } | null;
}

const UserCard = ({ type }: UserCardProps) => {
  const [count, setCount] = useState<number | null>(null);
  const [sessionName, setSessionName] = useState<string>("2024/25");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (res.ok) {
        const data: Analytics = await res.json();

        switch (type) {
          case "student":
            setCount(data.counts.students);
            break;
          case "teacher":
            setCount(data.counts.teachers);
            break;
          case "parent":
            setCount(data.counts.parents);
            break;
          case "staff":
            setCount(data.counts.staff);
            break;
          case "alumni":
            setCount(data.counts.alumni);
            break;
        }

        if (data.activeSession?.name) {
          setSessionName(data.activeSession.name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getCardStyles = () => {
    switch (type) {
      case "student":
        return {
          bg: "bg-gradient-to-br from-blue-500 to-blue-600",
          iconBg: "bg-blue-400/30",
          icon: (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          ),
        };
      case "teacher":
        return {
          bg: "bg-gradient-to-br from-amber-500 to-orange-500",
          iconBg: "bg-amber-400/30",
          icon: (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          ),
        };
      case "parent":
        return {
          bg: "bg-gradient-to-br from-purple-500 to-purple-600",
          iconBg: "bg-purple-400/30",
          icon: (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        };
      case "alumni":
        return {
          bg: "bg-gradient-to-br from-green-500 to-emerald-600",
          iconBg: "bg-green-400/30",
          icon: (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
              />
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-500 to-gray-600",
          iconBg: "bg-gray-400/30",
          icon: (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
        };
    }
  };

  const styles = getCardStyles();

  return (
    <div
      className={`${styles.bg} rounded-2xl p-5 flex-1 min-w-[200px] shadow-lg relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full text-white font-medium">
            {sessionName}
          </span>
          <div
            className={`w-10 h-10 ${styles.iconBg} rounded-xl flex items-center justify-center`}
          >
            {styles.icon}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-1">
          {loading ? (
            <span className="inline-block w-16 h-9 bg-white/20 animate-pulse rounded"></span>
          ) : (
            count?.toLocaleString() ?? "-"
          )}
        </h1>
        <h2 className="capitalize text-sm font-medium text-white/80">
          {type}s
        </h2>
      </div>
    </div>
  );
};

export default UserCard;
