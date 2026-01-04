"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/hooks/useUser";
import { showSuccess, showError } from "@/lib/toast";

interface Announcement {
  id: string | number;
  title: string;
  content: string;
  status: "draft" | "published";
  targetRoles?: string[];
  createdAt: string;
  publishedAt?: string;
  author?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  isRead?: boolean;
}

const AnnouncementListPage = () => {
  const { user, loading: userLoading } = useUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const userRole = user?.role?.toUpperCase() || "";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    fetchAnnouncements();
  }, [filter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = filter === "unread" ? "/api/announcement/unread" : "/api/announcement";
      const res = await fetch(endpoint, { credentials: "include" });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch announcements");
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.announcements || data.data || [];
      setAnnouncements(list);
    } catch (err: any) {
      console.error("Error fetching announcements:", err);
      setError(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string | number) => {
    try {
      const res = await fetch(`/api/announcement/${id}/read`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handlePublish = async (id: string | number) => {
    try {
      const res = await fetch(`/api/announcement/${id}/publish`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        showSuccess("Announcement published successfully");
        fetchAnnouncements();
      } else {
        const errorData = await res.json();
        showError(errorData.error || "Failed to publish announcement");
      }
    } catch (err: any) {
      showError(err.message || "Failed to publish announcement");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/announcement/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        showSuccess("Announcement deleted successfully");
        fetchAnnouncements();
      } else {
        const errorData = await res.json();
        showError(errorData.error || "Failed to delete announcement");
      }
    } catch (err: any) {
      showError(err.message || "Failed to delete announcement");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAuthorName = (author?: Announcement["author"]) => {
    if (!author) return "System";
    if (author.name) return author.name;
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    return "Unknown";
  };

  if (userLoading || loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Announcements</h1>
              <p className="text-green-100">Stay updated with school news and notices</p>
            </div>
          </div>
          {isAdmin && (
            <Link
              href="/list/announcements/create"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
            >
              + New Announcement
            </Link>
          )}
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === "all"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
            filter === "unread"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Unread
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
          <button onClick={fetchAnnouncements} className="ml-4 underline">
            Try again
          </button>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
          <p className="text-gray-500">
            {filter === "unread" ? "You have read all announcements." : "There are no announcements yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md ${
                announcement.isRead ? "border-gray-100" : "border-green-200 bg-green-50/30"
              }`}
              onClick={() => !announcement.isRead && handleMarkAsRead(announcement.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {!announcement.isRead && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {announcement.title}
                    </h3>
                    {announcement.status === "draft" && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By {getAuthorName(announcement.author)}</span>
                    <span>-</span>
                    <span>{formatDate(announcement.publishedAt || announcement.createdAt)}</span>
                    {announcement.targetRoles && announcement.targetRoles.length > 0 && (
                      <>
                        <span>-</span>
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {announcement.targetRoles.join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {announcement.status === "draft" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(announcement.id);
                        }}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <Link
                      href={`/list/announcements/${announcement.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(announcement.id);
                      }}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementListPage;
