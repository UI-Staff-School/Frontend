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
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Alumni Overview</h2>
        <Link
          href="/list/alumni"
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
        </div>
      ) : (
        <>
          {/* Total Alumni */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
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
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                By Session
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alumniStats.bySession.slice(0, 5).map((session, index) => (
                  <div
                    key={session.sessionId || index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm text-gray-600">
                      {session.sessionName}
                    </span>
                    <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
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
              <p className="text-xs mt-1">
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
