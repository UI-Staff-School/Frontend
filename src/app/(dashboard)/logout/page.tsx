"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { paths } from "@/lib/paths";

const LogoutPage = () => {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-logout on mount
    handleLogout();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setError(null);

      // Call signout API
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to sign out");
      }

      // Clear cookies on client side as well
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Clear localStorage
      localStorage.removeItem("userSettings");

      // Wait a moment for cleanup, then redirect
      setTimeout(() => {
        router.push(paths.auth.signIn);
      }, 500);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || "Failed to sign out. Please try again.");

      // Even if API fails, try to clear cookies and redirect
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem("userSettings");

      setTimeout(() => {
        router.push(paths.auth.signIn);
      }, 2000);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-xl rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image src="/logout.png" alt="" width={40} height={40} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Signing Out
          </h1>
          <p className="text-sm text-gray-500">
            {loggingOut
              ? "Please wait while we sign you out..."
              : error
              ? "An error occurred"
              : "You have been signed out successfully"}
          </p>
        </div>

        {loggingOut && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lamaPurple"></div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-500 text-xs mt-2">
              Redirecting to sign in page...
            </p>
          </div>
        )}

        {!loggingOut && !error && (
          <div className="space-y-3">
            <p className="text-green-600 text-sm">
              ✓ Successfully signed out
            </p>
            <p className="text-gray-500 text-xs">
              Redirecting to sign in page...
            </p>
          </div>
        )}

        {!loggingOut && error && (
          <button
            onClick={handleLogout}
            className="mt-4 w-full bg-lamaPurple text-white py-2.5 rounded-lg hover:bg-lamaPurpleDark transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default LogoutPage;

