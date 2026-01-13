"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import Image from "next/image";
import { showError, showSuccess } from "@/lib/toast";

interface ClassArm {
  id: number;
  name: string;
  classLevel?: {
    id: number;
    name: string;
  };
}

const religionOptions = ["Christian", "Muslim", "Other"] as const;

const studentSchema = z.object({
  admissionNo: z.string().min(1, "Admission number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  religion: z.enum(religionOptions, {
    message:
      "Religion must be one of the following values: Christian, Muslim, Other",
  }),
  classArmId: z.coerce.number().min(1, "Class Arm is required"),
  yearOfAdmission: z.string().min(1, "Year of admission is required"),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  type: "create" | "update";
  data?: any;
}

const StudentForm = ({ type, data }: StudentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [loadingClassArms, setLoadingClassArms] = useState(true);

  useEffect(() => {
    const fetchClassArms = async () => {
      try {
        const response = await fetch("/api/class/arms", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setClassArms(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch class arms:", error);
      } finally {
        setLoadingClassArms(false);
      }
    };
    fetchClassArms();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: data
      ? {
          ...data,
          classArmId: data.classArmId || data.classArm?.id || "",
        }
      : {
          admissionNo: "",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          gender: "",
          religion: "",
          classArmId: "",
          yearOfAdmission: "",
        },
  });

  const onSubmit = async (formData: StudentFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        yearOfAdmission: new Date(formData.yearOfAdmission).toISOString(),
      };

      const url =
        type === "create" ? "/api/student" : `/api/student/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

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
        let errorMessage = "Failed to save student";
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage;
        } catch {
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      showSuccess(`Student ${type === "create" ? "created" : "updated"} successfully`);
      reset();
      window.location.reload();
    } catch (error: any) {
      showError(error.message || "Failed to save student");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-2xl text-white">
            {type === "create" ? "+" : "Edit"}
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {type === "create" ? "Add New Student" : "Update Student"}
          </h2>
          <p className="text-gray-600">
            {type === "create"
              ? "Fill in the details to register a new student"
              : "Update the student information below"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admission Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register("admissionNo")}
                type="text"
                placeholder="Enter admission number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.admissionNo && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.admissionNo.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName")}
                type="text"
                placeholder="Enter first name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName")}
                type="text"
                placeholder="Enter last name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                {...register("dateOfBirth")}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🏠</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                {...register("gender")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Religion <span className="text-red-500">*</span>
              </label>
              <select
                {...register("religion")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                defaultValue={data?.religion || ""}
              >
                <option value="">Select religion</option>
                {religionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.religion && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.religion.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">Student</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Academic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Arm <span className="text-red-500">*</span>
              </label>
              <Controller
                name="classArmId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loadingClassArms}
                  >
                    <option value="">
                      {loadingClassArms ? "Loading classes..." : "Select class arm"}
                    </option>
                    {classArms.map((arm) => (
                      <option key={arm.id} value={arm.id}>
                        {arm.classLevel?.name} {arm.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.classArmId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.classArmId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Admission <span className="text-red-500">*</span>
              </label>
              <input
                {...register("yearOfAdmission")}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.yearOfAdmission && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.yearOfAdmission.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : type === "create"
              ? "Create Student"
              : "Update Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
