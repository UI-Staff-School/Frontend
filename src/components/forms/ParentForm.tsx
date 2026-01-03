"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";

const parentRoleOptions = ["Father", "Mother", "Guardian"] as const;
const religionOptions = ["Christian", "Muslim", "Other"] as const;

const schema = z.object({
  fullName: z.string().min(1, { message: "Full name is required!" }),
  parentRole: z.enum(parentRoleOptions, {
    message: "Parent role must be one of: Father, Mother, Guardian",
  }),
  religion: z.enum(religionOptions, {
    message: "Religion must be one of: Christian, Muslim, Other",
  }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .max(100, { message: "Email is too long" }),
  phoneNumber: z
    .string()
    .regex(/^0\d{10}$/, {
      message: "Phone number must follow 08121007480 format (11 digits, starts with 0)",
    }),
  address: z
    .string()
    .min(10, { message: "Address should be at least 10 characters long" })
    .max(200, { message: "Address should not exceed 200 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
});

type Inputs = z.infer<typeof schema>;

interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
}

interface LinkedStudent {
  admissionNo: string;
  firstName: string;
  lastName: string;
}

const ParentForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [linkError, setLinkError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data || {},
  });

  // Fetch available students for linking
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("/api/student", {
          credentials: "include",
        });
        if (response.ok) {
          const studentsData = await response.json();
          setStudents(Array.isArray(studentsData) ? studentsData : []);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      }
    };
    fetchStudents();

    // If editing, set existing linked students
    if (data?.students && Array.isArray(data.students)) {
      setLinkedStudents(data.students);
    }
  }, [data]);

  const handleLinkStudent = async () => {
    if (!selectedStudent) {
      setLinkError("Please select a student");
      return;
    }

    // Check if already linked
    if (linkedStudents.some((s) => s.admissionNo === selectedStudent)) {
      setLinkError("This student is already linked");
      return;
    }

    // Find student details
    const student = students.find((s) => s.admissionNo === selectedStudent);
    if (student) {
      setLinkedStudents([
        ...linkedStudents,
        {
          admissionNo: student.admissionNo,
          firstName: student.firstName,
          lastName: student.lastName,
        },
      ]);
      setSelectedStudent("");
      setLinkError("");
    }
  };

  const handleUnlinkStudent = (admissionNo: string) => {
    setLinkedStudents(linkedStudents.filter((s) => s.admissionNo !== admissionNo));
  };

  const onSubmit = handleSubmit(async (formData) => {
    try {
      setIsSubmitting(true);

      const url = type === "create" ? "/api/parent" : `/api/parent/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

      // Build payload matching API schema
      const payload: any = {
        fullName: formData.fullName,
        parentRole: formData.parentRole,
        religion: formData.religion,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
      };

      // Only include password for create
      if (type === "create" && formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${type} parent`);
      }

      // If creating/updating succeeded and we have students to link, link them
      if (type === "create" && linkedStudents.length > 0) {
        const createdParent = await response.json();
        for (const student of linkedStudents) {
          try {
            await fetch("/api/parent/link-student", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                parentId: createdParent.id,
                studentAdmissionNo: student.admissionNo,
              }),
            });
          } catch (linkError) {
            console.error(`Failed to link student ${student.admissionNo}:`, linkError);
          }
        }
      }

      console.log(`Parent ${type === "create" ? "created" : "updated"} successfully`);
      reset();
      window.location.reload();
    } catch (error: any) {
      console.error(`Error ${type === "create" ? "creating" : "updating"} parent:`, error.message);
      alert(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="text-center border-b border-gray-200 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">
              {type === "create" ? "+" : "✏️"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {type === "create" ? "Add New Parent" : "Update Parent"}
          </h1>
          <p className="text-gray-600 mt-2">
            {type === "create"
              ? "Fill in the details to register a new parent"
              : "Update the parent information below"}
          </p>
        </div>

        {/* Basic Information Section */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">👤</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("fullName")}
                defaultValue={data?.fullName}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter full name"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                {...register("parentRole")}
                defaultValue={data?.parentRole || ""}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select role</option>
                {parentRoleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.parentRole && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.parentRole.message}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
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
                placeholder="parent@example.com"
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

        {/* Password Section (only for create) */}
        {type === "create" && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🔒</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Account Security
              </h2>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter password (min 6 characters)"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                This password will be used by the parent to log into the portal.
              </p>
            </div>
          </div>
        )}

        {/* Link Students Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">👨‍👧‍👦</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Link Children/Students
            </h2>
          </div>

          <div className="space-y-4">
            {/* Add Student */}
            <div className="flex gap-3">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select a student to link</option>
                {students
                  .filter((s) => !linkedStudents.some((ls) => ls.admissionNo === s.admissionNo))
                  .map((student) => (
                    <option key={student.admissionNo} value={student.admissionNo}>
                      {student.firstName} {student.lastName} ({student.admissionNo})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleLinkStudent}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium"
              >
                Link
              </button>
            </div>
            {linkError && <p className="text-sm text-red-500">{linkError}</p>}

            {/* Linked Students List */}
            {linkedStudents.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Linked Students ({linkedStudents.length})
                </h3>
                <div className="space-y-2">
                  {linkedStudents.map((student) => (
                    <div
                      key={student.admissionNo}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-sm">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{student.admissionNo}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnlinkStudent(student.admissionNo)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {linkedStudents.length === 0 && (
              <p className="text-gray-500 text-sm italic">
                No students linked yet. Select students from the dropdown above to link them to this parent.
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
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : type === "create"
              ? "Create Parent"
              : "Update Parent"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParentForm;
