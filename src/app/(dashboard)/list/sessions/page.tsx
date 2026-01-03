"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";

interface Term {
  id: number | string;
  name: string;
  termName?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

interface Session {
  id: number | string;
  name: string;
  academicYear?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  terms?: Term[];
  Terms?: Term[];
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string | number>>(
    new Set()
  );
  const [activating, setActivating] = useState<string | null>(null);

  // Modal states
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | string | null>(null);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/session", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      const sessionList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.sessions)
        ? data.sessions
        : [];

      setSessions(sessionList);

      // Auto-expand active session
      const activeSession = sessionList.find((s: Session) => s.isActive);
      if (activeSession) {
        setExpandedSessions(new Set([activeSession.id]));
      }
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (sessionId: number | string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleActivateSession = async (sessionId: number | string) => {
    if (!confirm("Are you sure you want to activate this session?")) return;

    setActivating(`session-${sessionId}`);
    try {
      const response = await fetch(`/api/session/${sessionId}/activate`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to activate session");
      }

      await fetchSessions();
    } catch (err: any) {
      console.error("Error activating session:", err);
      alert(err.message || "Failed to activate session");
    } finally {
      setActivating(null);
    }
  };

  const handleActivateTerm = async (termId: number | string) => {
    if (!confirm("Are you sure you want to activate this term?")) return;

    setActivating(`term-${termId}`);
    try {
      const response = await fetch(`/api/session/term/${termId}/activate`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to activate term");
      }

      await fetchSessions();
    } catch (err: any) {
      console.error("Error activating term:", err);
      alert(err.message || "Failed to activate term");
    } finally {
      setActivating(null);
    }
  };

  const handleDeleteSession = async (sessionId: number | string) => {
    if (
      !confirm(
        "Are you sure you want to delete this session? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(`/api/session/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete session");
      }

      await fetchSessions();
    } catch (err: any) {
      console.error("Error deleting session:", err);
      alert(err.message || "Failed to delete session");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getSessionTerms = (session: Session): Term[] => {
    return session.terms || session.Terms || [];
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-semibold">Error loading sessions</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchSessions}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Academic Sessions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage academic sessions, terms, and student promotions
          </p>
        </div>
        {role === "admin" && (
          <FormModal table="session" type="create" />
        )}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📅</span>
          </div>
          <p className="font-medium">No sessions found</p>
          <p className="text-sm mt-1">Create your first academic session to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const terms = getSessionTerms(session);
            const isExpanded = expandedSessions.has(session.id);

            return (
              <div
                key={session.id}
                className={`border rounded-xl overflow-hidden ${
                  session.isActive
                    ? "border-indigo-300 bg-indigo-50/30"
                    : "border-gray-200"
                }`}
              >
                {/* Session Header */}
                <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        session.isActive
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span className="text-xl">📅</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">
                          {session.name || session.academicYear}
                        </h3>
                        {session.isActive && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(session.startDate)} -{" "}
                        {formatDate(session.endDate)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {terms.length} term{terms.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Session Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleExpand(session.id)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </button>

                    {role === "admin" && (
                      <>
                        {!session.isActive && (
                          <button
                            onClick={() => handleActivateSession(session.id)}
                            disabled={activating === `session-${session.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition disabled:opacity-50"
                          >
                            {activating === `session-${session.id}`
                              ? "Activating..."
                              : "Activate"}
                          </button>
                        )}

                        <FormModal
                          table="session"
                          type="update"
                          data={session}
                        />

                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 transition"
                          title="Delete session"
                        >
                          <span className="text-red-600 text-sm">🗑️</span>
                        </button>

                        <Link
                          href={`/list/sessions/promote/${session.id}`}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-md hover:from-purple-600 hover:to-pink-600 transition"
                        >
                          🎓 Promote
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Terms Section (Expandable) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Terms
                      </h4>
                      {role === "admin" && (
                        <button
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setEditingTerm(null);
                            setShowTermModal(true);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition"
                        >
                          + Add Term
                        </button>
                      )}
                    </div>

                    {terms.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">
                        No terms added yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {terms.map((term) => (
                          <div
                            key={term.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              term.isActive
                                ? "bg-teal-50 border border-teal-200"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  term.isActive ? "bg-teal-500" : "bg-gray-300"
                                }`}
                              ></div>
                              <div>
                                <p className="font-medium text-sm text-gray-800">
                                  {term.name || term.termName}
                                  {term.isActive && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded-full">
                                      ACTIVE
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(term.startDate)} -{" "}
                                  {formatDate(term.endDate)}
                                </p>
                              </div>
                            </div>

                            {role === "admin" && (
                              <div className="flex items-center gap-2">
                                {!term.isActive && (
                                  <button
                                    onClick={() => handleActivateTerm(term.id)}
                                    disabled={activating === `term-${term.id}`}
                                    className="px-2 py-1 text-xs text-teal-600 hover:bg-teal-100 rounded transition"
                                  >
                                    {activating === `term-${term.id}`
                                      ? "..."
                                      : "Activate"}
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedSessionId(session.id);
                                    setEditingTerm(term);
                                    setShowTermModal(true);
                                  }}
                                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Term Modal */}
      {showTermModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTerm ? "Edit Term" : "Add New Term"}
              </h2>
              <button
                onClick={() => {
                  setShowTermModal(false);
                  setSelectedSessionId(null);
                  setEditingTerm(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <TermFormInline
                type={editingTerm ? "update" : "create"}
                data={editingTerm}
                sessionId={selectedSessionId}
                onSuccess={() => {
                  setShowTermModal(false);
                  setSelectedSessionId(null);
                  setEditingTerm(null);
                  fetchSessions();
                }}
                onCancel={() => {
                  setShowTermModal(false);
                  setSelectedSessionId(null);
                  setEditingTerm(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Term Form Component
const TermFormInline = ({
  type,
  data,
  sessionId,
  onSuccess,
  onCancel,
}: {
  type: "create" | "update";
  data?: Term | null;
  sessionId?: number | string | null;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(data?.name || data?.termName || "");
  const [startDate, setStartDate] = useState(
    data?.startDate ? new Date(data.startDate).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    data?.endDate ? new Date(data.endDate).toISOString().split("T")[0] : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url =
        type === "create"
          ? "/api/session/create-term"
          : `/api/session/term/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

      const payload: any = { name, startDate, endDate };
      if (type === "create" && sessionId) {
        payload.sessionId = Number(sessionId);
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${type} term`);
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error saving term:", err);
      setError(err.message || "Failed to save term");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Term Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., First Term"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
        >
          {submitting ? "Saving..." : type === "create" ? "Create Term" : "Update Term"}
        </button>
      </div>
    </form>
  );
};

export default SessionsPage;
