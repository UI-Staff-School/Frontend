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
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-green-500/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-white/90">Current Session</h2>
          </div>
          <Link
            href="/list/sessions"
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Manage
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-7 bg-white/20 rounded-lg animate-pulse w-28"></div>
            <div className="h-5 bg-white/20 rounded animate-pulse w-24"></div>
          </div>
        ) : session ? (
          <>
            <p className="text-2xl font-bold">{session.name}</p>
            {session.activeTerm ? (
              <div className="mt-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-sm text-white/80 font-medium">
                  {session.activeTerm.name}
                </span>
              </div>
            ) : (
              <p className="text-sm text-white/70 mt-2">No active term</p>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-white/80">No active session</p>
            <Link
              href="/list/sessions"
              className="text-sm underline mt-1 inline-block hover:text-white"
            >
              Set up session
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionInfoCard;
