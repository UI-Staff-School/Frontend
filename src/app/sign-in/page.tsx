"use client";
import React, { useState } from "react";
import AuthenticationInput from "@/components/AuthenticationInput";
import PasswordInput from "@/components/PasswordInput";
import { useForm } from "react-hook-form";
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
    formState: { errors },
    reset,
  } = useForm();

  const handleSignIn = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(paths.api.auth.signin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Sign in failed");
      }
      // After sign in, fetch user profile
      const profileRes = await fetch(paths.api.auth.me);
      const profile = await profileRes.json();
      reset();
      router.push(paths.home);
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
              name="email"
              label="Email"
              placeholder="Enter your email"
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
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href={paths.auth.signUp}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
