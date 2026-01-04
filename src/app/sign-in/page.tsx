"use client";
import React, { useState } from "react";
import Image from "next/image";
import AuthenticationInput from "@/components/AuthenticationInput";
import PasswordInput from "@/components/PasswordInput";
import DropSelect from "@/components/DropSelect";
import { useForm } from "react-hook-form";
import { paths } from "@/lib/paths";
import { useRouter } from "next/navigation";
import { showError, showSuccess } from "@/lib/toast";
import Link from "next/link";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const handleSignIn = async (data: any) => {
    setIsLoading(true);
    try {
      // Call external API
      const response = await fetch(
        "https://ui-staff-school-backend.onrender.com/authentication/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            username: data.username,
            password: data.password,
            role: data.role,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Sign in failed");
      }

      // Store the access token and user data
      if (result.access_token) {
        // Set cookie with proper attributes
        const maxAge = 7 * 24 * 60 * 60; // 7 days
        // JWT tokens are safe to set directly (they're base64 encoded)
        document.cookie = `access_token=${result.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        // Also store as token for backwards compatibility
        document.cookie = `token=${result.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        console.log("Access token cookie set successfully");
        console.log(
          "Token value (first 50 chars):",
          result.access_token.substring(0, 50)
        );

        // Verify cookie was set (wait a bit for cookie to be set)
        setTimeout(() => {
          const cookieCheck = document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("access_token="));
          console.log(
            "Cookie verification:",
            cookieCheck ? "Cookie found" : "Cookie NOT found"
          );
          if (cookieCheck) {
            console.log(
              "Cookie value (first 50 chars):",
              cookieCheck.substring(0, 50)
            );
          }
        }, 100);
      } else if (result.token) {
        // Fallback for old format
        const maxAge = 7 * 24 * 60 * 60; // 7 days
        document.cookie = `access_token=${result.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `token=${result.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
        console.log("Token cookie set successfully");
      }

      reset();

      // Show success toast
      showSuccess("Signed in successfully! Redirecting...");

      // Route based on selected role
      if (data.role === "Admin") {
        router.push(paths.dashboard.admin);
      } else if (data.role === "Teacher") {
        router.push(paths.dashboard.teacher);
      } else if (data.role === "Parent") {
        router.push(paths.dashboard.parent);
      } else {
        router.push(paths.dashboard.student);
      }
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex relative">
      {/* Full-screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Signing you in...</h3>
              <p className="text-sm text-gray-500 mt-1">Please wait while we verify your credentials</p>
            </div>
          </div>
        </div>
      )}
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 mb-8">
            <Image
              src="/ui_logo.png"
              alt="UI Staff School"
              width={120}
              height={120}
              className="w-24 h-24"
            />
          </div>
          <h1 className="text-4xl font-bold text-white text-center mb-4">
            UI Staff School
          </h1>
          <p className="text-green-100 text-center text-lg mb-8">
            Excellence in Education
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
            <p className="text-white/90 text-center text-sm leading-relaxed">
              Access your personalized dashboard to manage academic activities,
              view results, track attendance, and stay connected with the school
              community.
            </p>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full"></div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Image
              src="/ui_logo.png"
              alt="UI Staff School"
              width={80}
              height={80}
              className="w-16 h-16 mb-3"
            />
            <h1 className="text-xl font-bold text-gray-900">UI Staff School</h1>
            <p className="text-sm text-gray-500">Excellence in Education</p>
          </div>

          {/* Back Link */}
          <Link
            href={paths.home}
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1">
                Sign in to access your portal
              </p>
            </div>

            <form
              onSubmit={handleSubmit(handleSignIn)}
              className="flex flex-col space-y-5"
            >
              <AuthenticationInput
                name="username"
                label="Username"
                placeholder="Enter your username"
                register={register}
                errors={errors}
              />
              <PasswordInput
                name="password"
                label="Password"
                placeholder="Enter your password"
                register={register}
                rules={{}}
                errors={errors}
              />
              <DropSelect
                name="role"
                label="Sign in as"
                placeholder="Select your role"
                control={control}
                options={[
                  { label: "Admin", value: "Admin" },
                  { label: "Teacher", value: "Teacher" },
                  { label: "Student", value: "Student" },
                  { label: "Parent", value: "Parent" },
                ]}
                errors={errors}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Need help accessing your account?
              </p>
              <p className="text-center text-sm text-gray-600 mt-1">
                Contact your school administrator
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; {new Date().getFullYear()} UI Staff School. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
