"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "@/lib/toast";

const ROLES = ["ADMIN", "COORDINATOR", "TEACHER", "STUDENT", "PARENT"];

const EditAnnouncementPage = () => {
  const router = useRouter();
  const params = useParams();
  const announcementId = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncement();
  }, [announcementId]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/announcement/${announcementId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch announcement");
      }

      const data = await res.json();
      const announcement = data.announcement || data;

      setTitle(announcement.title || "");
      setContent(announcement.content || "");
      setTargetRoles(announcement.targetRoles || []);
      setStatus(announcement.status || "draft");
    } catch (err: any) {
      setError(err.message || "Failed to load announcement");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setTargetRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSelectAll = () => {
    if (targetRoles.length === ROLES.length) {
      setTargetRoles([]);
    } else {
      setTargetRoles([...ROLES]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showError("Title and content are required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`/api/announcement/${announcementId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          targetRoles: targetRoles.length > 0 ? targetRoles : ROLES,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update announcement");
      }

      showSuccess("Announcement updated successfully");
      router.push("/list/announcements");
    } catch (err: any) {
      showError(err.message || "Failed to update announcement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
          <p>{error}</p>
          <Link href="/list/announcements" className="mt-4 inline-block text-red-600 underline">
            Back to Announcements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/list/announcements" className="hover:text-gray-700">
          Announcements
        </Link>
        <span>/</span>
        <span className="text-gray-800">Edit</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Announcement</h1>
            <p className="text-blue-100">Update announcement details</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "published" ? "bg-green-500/20 text-white" : "bg-yellow-500/20 text-white"
          }`}>
            {status === "published" ? "Published" : "Draft"}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter announcement content..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Target Roles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Target Audience
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {targetRoles.length === ROLES.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    targetRoles.includes(role)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/list/announcements"
              className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditAnnouncementPage;
