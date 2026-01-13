"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useEffect, useState } from "react";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";

type StaffProfile = {
  id: string;
  staffId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  religion?: string;
  role?: string;
  qualification?: string;
  dateOfBirth?: string;
};

const ProfilePage = () => {
  const { user, loading: userLoading } = useUser();
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/staff/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setStaff(data);
        } else {
          setError("Failed to load profile");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (user && !userLoading) {
      fetchProfile();
    }
  }, [user, userLoading]);

  const getInitials = () => {
    if (staff) {
      const first = staff.firstName?.charAt(0) || "";
      const last = staff.lastName?.charAt(0) || "";
      return `${first}${last}`.toUpperCase();
    }
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n: string) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  if (userLoading || loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lamaPurple mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT - Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Card */}
          <div className="bg-gradient-to-r from-lamaPurpleLight to-lamaPurple/20 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-lamaPurple">
                    {getInitials()}
                  </span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {staff?.firstName && staff?.lastName
                      ? `${staff.firstName} ${staff.lastName}`
                      : user?.name || "User"}
                  </h1>
                  {role === "admin" && staff && (
                    <FormModal table="teacher" type="update" data={staff} />
                  )}
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  {staff?.staffId && (
                    <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-gray-700">
                      {staff.staffId}
                    </span>
                  )}
                  {(staff?.role || user?.role) && (
                    <span className="px-3 py-1 bg-purple-100 rounded-full text-sm font-medium text-purple-800">
                      {staff?.role || user?.role}
                    </span>
                  )}
                  {staff?.gender && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        staff.gender === "Male"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-pink-100 text-pink-800"
                      }`}
                    >
                      {staff.gender}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {staff?.email && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium truncate">
                        {staff.email}
                      </span>
                    </div>
                  )}
                  {staff?.phoneNumber && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{staff.phoneNumber}</span>
                    </div>
                  )}
                  {staff?.dateOfBirth && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-gray-500">DOB:</span>
                      <span className="font-medium">
                        {new Date(staff.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          {staff && (
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {staff.staffId && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">ID</span>
                      </div>
                      <h3 className="font-medium text-gray-900">Staff ID</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{staff.staffId}</p>
                  </div>
                )}

                {staff.role && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">R</span>
                      </div>
                      <h3 className="font-medium text-gray-900">Role</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{staff.role}</p>
                  </div>
                )}

                {staff.qualification && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">Q</span>
                      </div>
                      <h3 className="font-medium text-gray-900">
                        Qualification
                      </h3>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {staff.qualification}
                    </p>
                  </div>
                )}

                {staff.gender && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">G</span>
                      </div>
                      <h3 className="font-medium text-gray-900">Gender</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{staff.gender}</p>
                  </div>
                )}

                {staff.religion && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">R</span>
                      </div>
                      <h3 className="font-medium text-gray-900">Religion</h3>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {staff.religion}
                    </p>
                  </div>
                )}

                {staff.address && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-lg sm:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">A</span>
                      </div>
                      <h3 className="font-medium text-gray-900">Address</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{staff.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT - Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* User Info Card */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">E</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 break-words">
                    {staff?.email || user?.email || "N/A"}
                  </p>
                </div>
              </div>
              {staff?.phoneNumber && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-sm">P</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {staff.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {(staff?.email || user?.email) && (
                <a
                  href={`mailto:${staff?.email || user?.email}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <span className="text-green-600">E</span>
                  <span className="text-gray-700">Send Email</span>
                </a>
              )}
              {role === "admin" && staff && (
                <FormModal table="teacher" type="update" data={staff} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
