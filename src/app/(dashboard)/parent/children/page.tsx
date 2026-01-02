"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Child {
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  classArm?: {
    name: string;
    classLevel?: {
      name: string;
    };
  };
}

const ChildrenListPage = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/parent/portal/children", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch children");
        }

        const data = await response.json();
        setChildren(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching children:", err);
        setError(err.message || "Failed to load children");
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl m-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl m-4">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-semibold">Error loading children</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">My Children</h1>
        <p className="text-teal-100">
          View and track your children&apos;s academic progress
        </p>
      </div>

      {/* Children Grid */}
      {children.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👨‍👧‍👦</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Children Linked
          </h2>
          <p className="text-gray-500">
            Contact the school administrator to link your children to your account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div
              key={child.admissionNo}
              className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              {/* Child Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {child.firstName?.[0]}{child.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {child.firstName} {child.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{child.admissionNo}</p>
                </div>
              </div>

              {/* Child Details */}
              <div className="space-y-2 mb-4 py-4 border-y border-gray-100">
                {child.classArm && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Class</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {child.classArm.classLevel?.name} {child.classArm.name}
                    </span>
                  </div>
                )}
                {child.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-sm">Gender</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {child.gender}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/parent/children/${child.admissionNo}/results`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                >
                  <span>📊</span>
                  Results
                </Link>
                <Link
                  href={`/parent/children/${child.admissionNo}/attendance`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-teal-50 text-teal-700 rounded-lg font-medium hover:bg-teal-100 transition-colors"
                >
                  <span>📅</span>
                  Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildrenListPage;
