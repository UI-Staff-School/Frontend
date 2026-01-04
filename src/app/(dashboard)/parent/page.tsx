"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Announcements from "@/components/Announcements";

interface Child {
  admissionNo: string;
  firstName: string;
  lastName: string;
  classArm?: {
    name: string;
    classLevel?: {
      name: string;
    };
  };
  gender?: string;
}

interface ParentInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

const ParentPage = () => {
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch parent info and children in parallel
        const [parentResponse, childrenResponse] = await Promise.all([
          fetch("/api/parent/portal/me", { credentials: "include" }),
          fetch("/api/parent/portal/children", { credentials: "include" }),
        ]);

        if (parentResponse.ok) {
          const parentData = await parentResponse.json();
          setParentInfo(parentData);
        }

        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json();
          setChildren(Array.isArray(childrenData) ? childrenData : []);
        }
      } catch (err: any) {
        console.error("Error fetching parent data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex gap-4 flex-col md:flex-row">
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {parentInfo?.firstName || "Parent"}!
          </h1>
          <p className="text-teal-100">
            Track your children&apos;s academic progress and stay connected with their education.
          </p>
        </div>

        {/* Children Overview */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">My Children</h2>
            <Link
              href="/parent/children"
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍👧‍👦</span>
              </div>
              <p className="font-medium">No children linked yet</p>
              <p className="text-sm">Contact the school administrator to link your children.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <div
                  key={child.admissionNo}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {child.firstName?.[0]}{child.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800">
                        {child.firstName} {child.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {child.admissionNo}
                      </p>
                      {child.classArm && (
                        <p className="text-sm text-teal-600">
                          {child.classArm.classLevel?.name} {child.classArm.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/parent/children/${child.admissionNo}/results`}
                      className="flex-1 text-center py-2 px-3 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                      Results
                    </Link>
                    <Link
                      href={`/parent/children/${child.admissionNo}/attendance`}
                      className="flex-1 text-center py-2 px-3 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                    >
                      Attendance
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">👨‍👧‍👦</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{children.length}</p>
            <p className="text-sm text-gray-500">Children</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">-</p>
            <p className="text-sm text-gray-500">Avg. Score</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">-</p>
            <p className="text-sm text-gray-500">Attendance</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">-</p>
            <p className="text-sm text-gray-500">Events</p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        {/* Parent Info Card */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Profile</h2>
          {parentInfo ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {parentInfo.firstName?.[0]}{parentInfo.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {parentInfo.firstName} {parentInfo.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Parent</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{parentInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-800">{parentInfo.phoneNumber}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Unable to load profile</p>
          )}
        </div>

        {/* Announcements */}
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
