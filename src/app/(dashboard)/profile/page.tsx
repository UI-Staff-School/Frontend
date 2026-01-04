"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { showError, showSuccess } from "@/lib/toast";

interface StaffProfile {
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
}

const ProfilePage = () => {
  const { user, loading: userLoading, error: userError } = useUser();
  const router = useRouter();
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch staff profile for admin/teacher
  useEffect(() => {
    const fetchStaffProfile = async () => {
      if (!user) return;

      // Only fetch staff profile for ADMIN or TEACHER roles
      if (user.role === "ADMIN" || user.role === "TEACHER") {
        try {
          const response = await fetch("/api/staff/me", {
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            console.log("[Profile] Staff data:", data);
            setStaffProfile(data.staff || data);
          }
        } catch (err) {
          console.error("[Profile] Failed to fetch staff profile:", err);
        }
      }
      setProfileLoading(false);
    };

    if (!userLoading) {
      fetchStaffProfile();
    }
  }, [user, userLoading]);

  const loading = userLoading || profileLoading;
  const error = userError;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        showSuccess("Logged out successfully");
        router.push("/sign-in");
      } else {
        throw new Error("Failed to logout");
      }
    } catch (err) {
      showError("Failed to logout. Please try again.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change password");
      }

      showSuccess("Password changed successfully");
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
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

  if (error || !user) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error loading profile</p>
            <button
              onClick={() => router.push("/sign-in")}
              className="mt-4 px-4 py-2 bg-lamaPurple text-white rounded-md hover:bg-lamaPurpleDark"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use staff profile data if available, otherwise fall back to user data
  const profile = staffProfile || user;

  const getUserDisplayName = () => {
    if (staffProfile?.firstName && staffProfile?.lastName) {
      return `${staffProfile.firstName} ${staffProfile.lastName}`;
    }
    if (user.name) return user.name;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    return user.email || "User";
  };

  const getInitials = () => {
    if (staffProfile?.firstName && staffProfile?.lastName) {
      return `${staffProfile.firstName.charAt(0)}${staffProfile.lastName.charAt(0)}`;
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user.name) {
      const parts = user.name.split(" ");
      return parts.length > 1
        ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`
        : user.name.charAt(0);
    }
    return user.email?.charAt(0).toUpperCase() || "U";
  };

  const getEmail = () => staffProfile?.email || user.email || "N/A";
  const getRole = () => staffProfile?.role || user.role || "N/A";
  const getId = () => staffProfile?.staffId || staffProfile?.id || user.id || "N/A";

  const getRoleColor = () => {
    switch (user.role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "TEACHER":
        return "bg-blue-100 text-blue-800";
      case "STUDENT":
        return "bg-green-100 text-green-800";
      case "PARENT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-2 sm:p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-4">
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
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {getUserDisplayName()}
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor()}`}>
                    {getRole()}
                  </span>
                  <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-gray-700">
                    ID: {getId()}
                  </span>
                  {staffProfile?.gender && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      staffProfile.gender === "Male" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                    }`}>
                      {staffProfile.gender}
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{getEmail()}</p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">ID</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Staff ID</h4>
                </div>
                <p className="text-gray-700 font-medium">{getId()}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">R</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Role</h4>
                </div>
                <p className="text-gray-700 font-medium">{getRole()}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">E</span>
                  </div>
                  <h4 className="font-medium text-gray-900">Email</h4>
                </div>
                <p className="text-gray-700 font-medium break-words">{getEmail()}</p>
              </div>

              {staffProfile?.phoneNumber && (
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">P</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Phone</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{staffProfile.phoneNumber}</p>
                </div>
              )}

              {staffProfile?.gender && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">G</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Gender</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{staffProfile.gender}</p>
                </div>
              )}

              {staffProfile?.qualification && (
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">Q</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Qualification</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{staffProfile.qualification}</p>
                </div>
              )}

              {staffProfile?.religion && (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">R</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Religion</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{staffProfile.religion}</p>
                </div>
              )}

              {staffProfile?.address && (
                <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-lg sm:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">A</span>
                    </div>
                    <h4 className="font-medium text-gray-900">Address</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{staffProfile.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lamaPurple focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lamaPurple focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lamaPurple focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-lamaPurple text-white rounded-lg hover:bg-lamaPurpleDark transition-colors disabled:opacity-50"
                  >
                    {passwordLoading ? "Saving..." : "Save Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-500 text-sm">
                Keep your account secure by using a strong password.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/")}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left"
              >
                <span className="text-blue-600">H</span>
                <span className="text-gray-700">Go to Dashboard</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-left"
              >
                <span className="text-red-600">L</span>
                <span className="text-gray-700">Logout</span>
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Active Session</span>
              </div>
              <p className="text-xs text-gray-500">
                You are currently logged in. Your session will expire after a period of inactivity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
