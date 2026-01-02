"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ActiveSession {
  id: string | number;
  name: string;
  activeTerm?: {
    id: string | number;
    name: string;
  };
}

const SessionInfoCard = () => {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.activeSession) {
          setSession(data.activeSession);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-indigo-100">Current Session</h2>
        <Link
          href="/list/sessions"
          className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
        >
          Manage
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 bg-white/20 rounded animate-pulse w-24"></div>
          <div className="h-4 bg-white/20 rounded animate-pulse w-20"></div>
        </div>
      ) : session ? (
        <>
          <p className="text-xl font-bold">{session.name}</p>
          {session.activeTerm ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-indigo-100">
                {session.activeTerm.name}
              </span>
            </div>
          ) : (
            <p className="text-sm text-indigo-200 mt-1">No active term</p>
          )}
        </>
      ) : (
        <div className="text-center py-2">
          <p className="text-indigo-200">No active session</p>
          <Link
            href="/list/sessions"
            className="text-sm underline mt-1 inline-block"
          >
            Set up session
          </Link>
        </div>
      )}
    </div>
  );
};

export default SessionInfoCard;
