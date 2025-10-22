"use client";
import React, { useState } from "react";
import AuthenticationInput from "@/components/AuthenticationInput";
import PasswordInput from "@/components/PasswordInput";
import DropSelect from "@/components/DropSelect";
import { useForm, Controller } from "react-hook-form";
import { paths } from "@/lib/paths";
import { useRouter } from "next/navigation";
import { showError } from "@/lib/toast";
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

      // Store the external token and user data
      if (result.token) {
        document.cookie = `token=${result.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
      }

      reset();

      // Route based on selected role
      if (data.role === "Admin") {
        router.push(paths.dashboard.admin);
      } else if (data.role === "Teacher") {
        router.push(paths.dashboard.teacher);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <Link
          href={paths.home}
          className="absolute -top-10 left-0 text-sm text-indigo-600 hover:text-indigo-800 transition"
        >
          ← Back to Home
        </Link>

        <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-xl rounded-2xl p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
          </div>

          <form
            onSubmit={handleSubmit(handleSignIn)}
            className="flex flex-col space-y-4"
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
              label="Role"
              placeholder="Select your role"
              control={control}
              options={[
                { label: "Admin", value: "Admin" },
                { label: "Teacher", value: "Teacher" },
                { label: "Student", value: "Student" },
              ]}
              errors={errors}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Contact your administrator for account access
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
