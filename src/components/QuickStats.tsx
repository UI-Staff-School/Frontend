"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AlumniStats {
  total: number;
  bySession: Array<{
    sessionId: string | number;
    sessionName: string;
    count: number;
  }>;
}

const QuickStats = () => {
  const [alumniStats, setAlumniStats] = useState<AlumniStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.alumniStats) {
          setAlumniStats(data.alumniStats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Alumni Overview
          </h2>
        </div>
        <Link
          href="/list/alumni"
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
        </div>
      ) : (
        <>
          {/* Total Alumni */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {alumniStats?.total?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-600">Total Graduates</p>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          {alumniStats?.bySession && alumniStats.bySession.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">
                By Session
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alumniStats.bySession.slice(0, 5).map((session, index) => (
                  <div
                    key={session.sessionId || index}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 font-medium">
                      {session.sessionName}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 bg-white px-2.5 py-1 rounded-lg shadow-sm">
                      {session.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!alumniStats || alumniStats.total === 0) && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No alumni data yet</p>
              <p className="text-xs mt-1 text-gray-400">
                Alumni are created when students are promoted from final year
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuickStats;
