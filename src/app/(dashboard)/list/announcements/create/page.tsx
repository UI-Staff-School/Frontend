"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccess, showError } from "@/lib/toast";

const ROLES = ["ADMIN", "COORDINATOR", "TEACHER", "STUDENT", "PARENT"];

const CreateAnnouncementPage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showError("Title and content are required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          targetRoles: targetRoles.length > 0 ? targetRoles : ROLES,
          status: publish ? "published" : "draft",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create announcement");
      }

      showSuccess(publish ? "Announcement published successfully" : "Announcement saved as draft");
      router.push("/list/announcements");
    } catch (err: any) {
      showError(err.message || "Failed to create announcement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/list/announcements" className="hover:text-gray-700">
          Announcements
        </Link>
        <span>/</span>
        <span className="text-gray-800">Create</span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <h1 className="text-2xl font-bold">Create Announcement</h1>
        <p className="text-green-100">Share important news with the school community</p>
      </div>

      {/* Form */}
      <form className="bg-white rounded-2xl p-6 border border-gray-100">
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
                className="text-sm text-green-600 hover:text-green-700"
              >
                {targetRoles.length === ROLES.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Select which roles should see this announcement (leave empty for all)
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    targetRoles.includes(role)
                      ? "bg-green-500 text-white"
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
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={saving}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Publishing..." : "Publish Now"}
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

export default CreateAnnouncementPage;
