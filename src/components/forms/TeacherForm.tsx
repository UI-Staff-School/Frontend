"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { showError, showSuccess } from "@/lib/toast";

const religionOptions = ["Christian", "Muslim", "Other"] as const;
const qualificationOptions = [
  "Diploma",
  "BEd",
  "MEd",
  "PhD",
  "BSc",
  "Other",
] as const;

// Password schema
const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters!" })
  .max(100, { message: "Password must be less than 100 characters!" });

// Base schema without password fields
const baseSchema = z.object({
  staffId: z.string().min(1, { message: "Staff ID is required!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  lastName: z.string().min(1, { message: "Last name is required!" }),
  dateOfBirth: z
    .string()
    .min(1, { message: "Date of birth is required!" })
    .refine(
      (value) => {
        const dob = new Date(value);
        if (Number.isNaN(dob.getTime())) return false;
        const today = new Date();
        const minAgeDate = new Date(
          today.getFullYear() - 18,
          today.getMonth(),
          today.getDate()
        );
        const maxAgeDate = new Date(
          today.getFullYear() - 70,
          today.getMonth(),
          today.getDate()
        );
        // Staff must be between 18 and 70 years old
        return dob <= minAgeDate && dob >= maxAgeDate;
      },
      {
        message: "Staff must be between 18 and 70 years old",
      }
    ),
  gender: z.string().min(1, { message: "Gender is required!" }),
  religion: z.enum(religionOptions, {
    message:
      "Religion must be one of the following values: Christian, Muslim, Other",
  }),
  phoneNumber: z.string().regex(/^0\d{10}$/, {
    message:
      "Phone number must follow 08121007480 format (11 digits, starts with 0)",
  }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .max(100, { message: "Email is too long" }),
  address: z
    .string()
    .min(10, { message: "Address should be at least 10 characters long" })
    .max(200, { message: "Address should not exceed 200 characters" }),
  role: z.string().min(1, { message: "Role is required!" }),
  qualification: z.enum(qualificationOptions, {
    message:
      "Qualification must be one of the following values: Diploma, BEd, MEd, PhD, BSc, Other",
  }),
});

// Schema for create (with password and confirmPassword)
const createSchema = baseSchema
  .extend({
    password: passwordSchema,
    confirmPassword: z.string().min(1, {
      message: "Confirm Password is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Schema for update (password optional, no confirmPassword)
const updateSchema = baseSchema.extend({
  password: passwordSchema.optional(),
});

type CreateInputs = z.infer<typeof createSchema>;
type UpdateInputs = z.infer<typeof updateSchema>;
type Inputs = CreateInputs | UpdateInputs;

const TeacherForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const schema = type === "create" ? createSchema : updateSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const url = type === "create" ? "/api/staff" : `/api/staff/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

      // Prepare payload - exclude confirmPassword if it exists
      const payload =
        type === "create"
          ? (() => {
              const { confirmPassword, ...rest } = formData as CreateInputs;
              return rest;
            })()
          : (formData as UpdateInputs);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log("[TeacherForm] Raw error response:", text);

        let errorMessage = `Failed to ${type} staff`;

        try {
          const errorData = JSON.parse(text);
          console.log("[TeacherForm] Parsed error:", errorData);

          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors
              .map((e: any) => e.message || e)
              .join(", ");
          }
        } catch {
          if (text) errorMessage = text;
        }

        throw new Error(errorMessage);
      }

      showSuccess(
        `Staff ${type === "create" ? "created" : "updated"} successfully`
      );
      window.location.reload();
    } catch (error: any) {
      showError(error.message || `Failed to ${type} staff`);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="text-center border-b border-gray-200 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">
              {type === "create" ? "+" : "Edit"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {type === "create" ? "Add New Staff Member" : "Update Staff Member"}
          </h1>
          <p className="text-gray-600 mt-2">
            {type === "create"
              ? "Fill in the details to create a new staff member"
              : "Update the staff member information below"}
          </p>
        </div>

        {/* Basic Information Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"></div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Staff ID <span className="text-red-500">*</span>
              </label>
              <input
                {...register("staffId")}
                defaultValue={data?.staffId}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter staff ID (e.g., STF001)"
              />
              {errors.staffId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.staffId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName")}
                defaultValue={data?.firstName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName")}
                defaultValue={data?.lastName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                {...register("dateOfBirth")}
                type="date"
                defaultValue={data?.dateOfBirth}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📞</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                {...register("email")}
                type="email"
                defaultValue={data?.email}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="staff@school.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register("phoneNumber")}
                defaultValue={data?.phoneNumber}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="08121007480"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("address")}
                defaultValue={data?.address}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🏠</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                {...register("gender")}
                defaultValue={data?.gender}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Religion <span className="text-red-500">*</span>
              </label>
              <select
                {...register("religion")}
                defaultValue={data?.religion || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select religion</option>
                {religionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.religion && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.religion.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">💼</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Professional Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register("role")}
                defaultValue={data?.role}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Role</option>
                <option value="Admin">Admin</option>
                <option value="Teacher">Teacher</option>
              </select>
              {errors.role && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Qualification <span className="text-red-500">*</span>
              </label>
              <select
                {...register("qualification")}
                defaultValue={data?.qualification || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select qualification</option>
                {qualificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.qualification && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.qualification.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Authentication Section */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Lock</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Authentication
            </h2>
          </div>

          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password{" "}
                {type === "create" && <span className="text-red-500">*</span>}
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                placeholder={
                  type === "create"
                    ? "Enter secure password"
                    : "Enter new password (leave blank to keep current)"
                }
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1"></p>
            </div>

            {type === "create" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                  placeholder="Re-enter password"
                />
                {type === "create" &&
                  "confirmPassword" in errors &&
                  errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
              </div>
            )}
            {type === "update" && (
              <p className="text-xs text-gray-500 mt-1">
                Leave password blank to keep the current password.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
            onClick={() => window.location.reload()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {type === "create" ? "Create Staff Member" : "Update Staff Member"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;
