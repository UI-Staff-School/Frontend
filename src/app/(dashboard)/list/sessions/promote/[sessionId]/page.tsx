"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PromotionPreview {
  classTransitions?: Array<{
    fromClass: string;
    toClass: string;
    studentCount: number;
  }>;
  alumniCount?: number;
  totalStudents?: number;
  message?: string;
}

interface Session {
  id: number | string;
  name: string;
  academicYear?: string;
}

const PromotionPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [preview, setPreview] = useState<PromotionPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session details and promotion preview in parallel
      const [sessionRes, previewRes] = await Promise.all([
        fetch(`/api/session/${sessionId}`, { credentials: "include" }),
        fetch(`/api/session/${sessionId}/purge/preview`, {
          credentials: "include",
        }),
      ]);

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setSession(sessionData);
      }

      if (previewRes.ok) {
        const previewData = await previewRes.json();
        setPreview(previewData);
      } else {
        const errorData = await previewRes.json();
        // If preview fails, show a message but don't block the page
        setPreview({
          message: errorData.error || "Could not load promotion preview",
        });
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This action is IRREVERSIBLE!\n\nAre you absolutely sure you want to promote all students to the next class level?\n\nFinal year students will be moved to Alumni and will no longer appear in active student lists."
      )
    )
      return;

    // Double confirmation for safety
    if (
      !confirm(
        "This is your FINAL confirmation.\n\nClick OK to proceed with the promotion."
      )
    )
      return;

    setPromoting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/session/${sessionId}/purge`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to promote students");
      }

      const result = await response.json();
      setSuccess(
        result.message || "Students have been successfully promoted!"
      );

      // Redirect after short delay
      setTimeout(() => {
        router.push("/list/sessions");
      }, 3000);
    } catch (err: any) {
      console.error("Error promoting students:", err);
      setError(err.message || "Failed to promote students");
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/list/sessions" className="hover:text-gray-700">
            Sessions
          </Link>
          <span>/</span>
          <span className="text-gray-800">Student Promotion</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Student Promotion
            </h1>
            <p className="text-gray-500">
              {session?.name || session?.academicYear || `Session ${sessionId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-800">
              Warning: Irreversible Action
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              This action will promote all students to their next class level.
              Final year students will be moved to the Alumni list. This cannot
              be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">❌</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-green-700 font-medium">{success}</p>
              <p className="text-green-600 text-sm mt-1">
                Redirecting to sessions page...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {preview && !success && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Preview of Changes
          </h2>

          {preview.message && !preview.classTransitions ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
              <p>{preview.message}</p>
              <p className="text-sm mt-2">
                The promotion will move students to their next class level.
              </p>
            </div>
          ) : (
            <>
              {/* Class Transitions Table */}
              {preview.classTransitions && preview.classTransitions.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Current Class
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                          →
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          New Class
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                          Students
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {preview.classTransitions.map((transition, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-800">
                            {transition.fromClass}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">
                            →
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                transition.toClass === "Alumni"
                                  ? "text-purple-600 font-medium"
                                  : "text-gray-800"
                              }
                            >
                              {transition.toClass}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {transition.studentCount} students
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {preview.totalStudents || "-"}
                  </p>
                  <p className="text-sm text-blue-700">Total Students</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {(preview.totalStudents || 0) - (preview.alumniCount || 0)}
                  </p>
                  <p className="text-sm text-green-700">To Be Promoted</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {preview.alumniCount || 0}
                  </p>
                  <p className="text-sm text-purple-700">Graduating to Alumni</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!success && (
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Link
            href="/list/sessions"
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </Link>
          <button
            onClick={handlePromote}
            disabled={promoting}
            className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {promoting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Promoting...
              </>
            ) : (
              <>
                🎓 Confirm Promotion
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionPage;
