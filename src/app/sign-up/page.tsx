"use client";
import React, { useState } from "react";
import AuthenticationInput from "@/components/AuthenticationInput";
import PasswordInput from "@/components/PasswordInput";
import DropSelect from "@/components/DropSelect";
import { useForm, FormProvider } from "react-hook-form";
import { paths } from "@/lib/paths";
import { showError, showSuccess } from "@/lib/toast";
import Link from "next/link";

const titleOptions = [
  { label: "Mr", value: "mr" },
  { label: "Mrs", value: "mrs" },
  { label: "Miss", value: "miss" },
  { label: "Dr", value: "dr" },
  { label: "Prof", value: "prof" },
];
const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Lecturer", value: "lecturer" },
  { label: "Student", value: "student" },
];

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const methods = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      title: "",
      role: "",
      phone: "",
      address: "",
    },
    mode: "onTouched",
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
    getValues,
    reset,
  } = methods;
  const passwordValue = watch("password");

  const handleNext = async (data: any) => {
    // Validate step 1 fields
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.password ||
      !data.confirmPassword
    ) {
      setError("Please fill all fields");
      showError("Please fill all fields");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      showError("Passwords do not match");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSignUp = async (data: any) => {
    // Validate step 2 fields for required title and role
    if (!data.title) {
      setError("Title is required");
      methods.setError("title", {
        type: "manual",
        message: "Title is required",
      });
      showError("Title is required");
      return;
    }
    if (!data.role) {
      setError("Role is required");
      methods.setError("role", { type: "manual", message: "Role is required" });
      showError("Role is required");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(paths.api.auth.signup, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          title: data.title,
          role: data.role.toUpperCase(),
          phone: data.phone,
          address: data.address,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Sign up failed");
      }
      showSuccess(
        "Account created successfully! Please sign in with your credentials."
      );
      reset();
      // Optionally, you could redirect to sign-in here
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl">
        <Link
          href={paths.home}
          className="absolute -top-10 left-0 text-sm text-indigo-600 hover:text-indigo-800 transition"
        >
          ← Back to Home
        </Link>

        <div className="bg-white/80 backdrop-blur-xl border border-purple-100 shadow-xl rounded-2xl p-6 sm:p-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Create your account
            </h1>
            <p className="text-sm text-gray-500 mt-1">Join and get started</p>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={
                step === 1
                  ? handleSubmit(handleNext)
                  : handleSubmit(handleSignUp)
              }
              className="flex flex-col"
            >
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AuthenticationInput
                      name="firstName"
                      label="First Name"
                      placeholder="Enter your first name"
                      register={register}
                      rules={{ required: "First Name is required" }}
                      errors={errors}
                    />
                    <AuthenticationInput
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter your last name"
                      register={register}
                      rules={{ required: "Last Name is required" }}
                      errors={errors}
                    />
                    <div className="sm:col-span-2">
                      <AuthenticationInput
                        name="email"
                        label="Email"
                        placeholder="Enter your email"
                        register={register}
                        rules={{
                          required: "Email is required",
                          pattern: {
                            value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: "Invalid email address",
                          },
                        }}
                        errors={errors}
                      />
                    </div>
                    <PasswordInput
                      name="password"
                      label="Password"
                      placeholder="Enter your password"
                      register={register}
                      rules={{
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message:
                            "Password must be at least 6 characters long",
                        },
                        validate: (value: string) =>
                          /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/.test(
                            value
                          ) || "Password must contain at least one symbol",
                      }}
                      errors={errors}
                    />
                    <PasswordInput
                      name="confirmPassword"
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      register={register}
                      rules={{
                        required: "Confirm password is required",
                        validate: (value: string) =>
                          value === passwordValue || "Passwords do not match",
                      }}
                      errors={errors}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-8 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AuthenticationInput
                      name="phone"
                      label="Phone Number"
                      type="tel"
                      placeholder="Enter your phone number"
                      register={register}
                      errors={errors}
                      required
                    />
                    <AuthenticationInput
                      name="address"
                      label="Address"
                      type="text"
                      placeholder="Enter your address"
                      register={register}
                      errors={errors}
                      required
                    />
                    <DropSelect
                      name="title"
                      label="Title"
                      placeholder="Select your title"
                      control={control}
                      options={titleOptions}
                      errors={errors}
                    />
                    <DropSelect
                      name="role"
                      label="Role"
                      placeholder="Select your role"
                      control={control}
                      options={roleOptions}
                      errors={errors}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-4 my-2">
                    <button
                      type="button"
                      className="w-full mt-5 bg-gray-100 text-gray-900 py-2.5 rounded-lg hover:bg-gray-200 border border-gray-300 transition"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-5 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Signing Up..." : "Sign Up"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </FormProvider>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href={paths.auth.signIn}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
