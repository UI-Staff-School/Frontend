"use client";

import { useUser } from "@/lib/hooks/useUser";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  staffId?: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  religion?: string;
  qualification?: string;
  dateOfBirth?: string;
};

const ProfilePage = () => {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Try to fetch detailed profile based on role
        let profileData: UserProfile | null = null;

        if (user.role === "ADMIN" || user.role === "TEACHER") {
          // Fetch staff details
          const response = await fetch("/api/staff/me", {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            profileData = data.staff || data;
          }
        } else if (user.role === "STUDENT") {
          // Fetch student details
          const response = await fetch("/api/student/me", {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            profileData = data.student || data;
          }
        }

        // Fallback to basic user data if detailed profile not available
        if (!profileData) {
          profileData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            role: user.role,
          };
        }

        setProfile(profileData);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to load profile");
        // Fallback to basic user data
        setProfile({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          role: user.role,
        });
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading) {
      fetchProfile();
    }
  }, [user, userLoading]);

  const getDisplayName = () => {
    if (!profile) return "Loading...";
    if (profile.name) return profile.name;
    if (profile.firstName && profile.lastName)
      return `${profile.firstName} ${profile.lastName}`;
    if (profile.firstName) return profile.firstName;
    return profile.email || "User";
  };

  const getInitials = () => {
    if (!profile) return "U";
    if (profile.firstName && profile.lastName)
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
    if (profile.name) {
      const parts = profile.name.split(" ");
      if (parts.length >= 2)
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
      return parts[0].charAt(0);
    }
    if (profile.firstName) return profile.firstName.charAt(0);
    return profile.email?.charAt(0).toUpperCase() || "U";
  };

  if (userLoading || loading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lamaPurple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-lamaPurple text-white rounded-md hover:bg-lamaPurpleDark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p className="text-gray-600">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 gap-4 grid grid-cols-1 lg:grid-cols-3">
      {/* LEFT - Main Profile */}
      <div className="w-full lg:col-span-2">
        {/* TOP - Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-4 sm:py-6 px-3 sm:px-4 rounded-md lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-4xl font-medium text-white">
                    {getInitials()}
                  </span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                    {getDisplayName()}
                  </h1>
                  <p className="text-sm text-gray-600 text-center sm:text-left mt-1">
                    {profile.role}{" "}
                    {profile.qualification && `- ${profile.qualification}`}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                  {profile.gender && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Image
                        src="/blood.png"
                        alt=""
                        width={12}
                        height={12}
                        className="sm:w-3.5 sm:h-3.5"
                      />
                      <span className="truncate">{profile.gender}</span>
                    </div>
                  )}
                  {profile.dateOfBirth && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Image
                        src="/date.png"
                        alt=""
                        width={12}
                        height={12}
                        className="sm:w-3.5 sm:h-3.5"
                      />
                      <span className="truncate">
                        {new Date(profile.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Image
                      src="/mail.png"
                      alt=""
                      width={12}
                      height={12}
                      className="sm:w-3.5 sm:h-3.5"
                    />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Image
                        src="/phone.png"
                        alt=""
                        width={12}
                        height={12}
                        className="sm:w-3.5 sm:h-3.5"
                      />
                      <span className="truncate">{profile.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-4">
              {profile.staffId && (
                <div className="bg-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Image
                    src="/singleAttendance.png"
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5 sm:w-6 sm:h-6 mx-auto sm:mx-0"
                  />
                  <div className="text-center sm:text-left">
                    <h1 className="text-lg sm:text-xl font-semibold">
                      {profile.staffId}
                    </h1>
                    <span className="text-xs sm:text-sm text-gray-400">
                      Staff ID
                    </span>
                  </div>
                </div>
              )}
              <div className="bg-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Image
                  src="/singleBranch.png"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 sm:w-6 sm:h-6 mx-auto sm:mx-0"
                />
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl font-semibold">
                    {profile.role}
                  </h1>
                  <span className="text-xs sm:text-sm text-gray-400">Role</span>
                </div>
              </div>
              {profile.qualification && (
                <div className="bg-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Image
                    src="/singleLesson.png"
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5 sm:w-6 sm:h-6 mx-auto sm:mx-0"
                  />
                  <div className="text-center sm:text-left">
                    <h1 className="text-lg sm:text-xl font-semibold">
                      {profile.qualification}
                    </h1>
                    <span className="text-xs sm:text-sm text-gray-400">
                      Qualification
                    </span>
                  </div>
                </div>
              )}
              {profile.religion && (
                <div className="bg-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Image
                    src="/singleClass.png"
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5 sm:w-6 sm:h-6 mx-auto sm:mx-0"
                  />
                  <div className="text-center sm:text-left">
                    <h1 className="text-lg sm:text-xl font-semibold">
                      {profile.religion}
                    </h1>
                    <span className="text-xs sm:text-sm text-gray-400">
                      Religion
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM - Profile Details */}
        <div className="mt-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Profile Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {profile.staffId && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm">🆔</span>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Staff ID
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {profile.staffId}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm">💼</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                  Role
                </h3>
              </div>
              <p className="text-gray-600 text-sm sm:text-base">
                {profile.role}
              </p>
            </div>

            {profile.qualification && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Qualification
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {profile.qualification}
                </p>
              </div>
            )}

            {profile.gender && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Gender
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {profile.gender}
                </p>
              </div>
            )}

            {profile.religion && (
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Religion
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {profile.religion}
                </p>
              </div>
            )}

            {profile.dateOfBirth && (
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                    Date of Birth
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  {new Date(profile.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT - Contact & Actions */}
      <div className="w-full lg:col-span-1 grid gap-4 sm:gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Contact Information
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xs sm:text-sm">📧</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {profile.email}
                </p>
              </div>
            </div>
            {profile.phoneNumber && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xs sm:text-sm">📞</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {profile.phoneNumber}
                  </p>
                </div>
              </div>
            )}
            {profile.address && (
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-1">
                  <span className="text-purple-600 text-xs sm:text-sm">📍</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {profile.address}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => router.push("/settings")}
              className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span className="text-gray-700 text-sm sm:text-base">
                Edit Settings
              </span>
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <span className="text-purple-600 text-sm sm:text-base">📄</span>
              <span className="text-gray-700 text-sm sm:text-base">
                View Full Profile
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
