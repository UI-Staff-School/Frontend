"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

const schema = z.object({
  armName: z.string().min(1, { message: "Arm name is required!" }),
  classLevelId: z.number().min(1, { message: "Class level is required!" }),
  teacherId: z.string().min(1, { message: "Teacher ID is required!" }),
});

type Inputs = z.infer<typeof schema>;

type ClassLevel = {
  id: string;
  className: string;
};

type Staff = {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  role: string;
};

const ClassArmForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [levelsResponse, staffResponse] = await Promise.all([
          fetch("/api/class/level"),
          fetch("/api/staff"),
        ]);

        if (levelsResponse.ok) {
          const levelsData = await levelsResponse.json();
          setClassLevels(Array.isArray(levelsData) ? levelsData : []);
        }

        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          setStaff(Array.isArray(staffData) ? staffData : []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data
      ? {
          armName: data.armName || "",
          classLevelId: data.classLevelId
            ? parseInt(data.classLevelId)
            : undefined,
          teacherId: data.teacherId || "",
        }
      : {
          armName: "",
          classLevelId: undefined,
          teacherId: "",
        },
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const url =
        type === "create" ? "/api/class/arms" : `/api/class/arms/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${type} class arm`);
      }

      window.location.reload();
    } catch (error: any) {
      console.error(
        `Error ${type === "create" ? "creating" : "updating"} class arm:`,
        error.message
      );
      alert(error.message || `Failed to ${type} class arm`);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="text-center border-b border-gray-200 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">
              {type === "create" ? "+" : "✏️"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {type === "create" ? "Add New Class Arm" : "Update Class Arm"}
          </h1>
          <p className="text-gray-600 mt-2">
            {type === "create"
              ? "Fill in the details to create a new class arm"
              : "Update the class arm information below"}
          </p>
        </div>

        {/* Form Fields */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arm Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("armName")}
              type="text"
              placeholder="Enter arm name (e.g., A, B, C)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            {errors.armName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.armName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Level <span className="text-red-500">*</span>
            </label>
            <select
              {...register("classLevelId", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Select class level</option>
              {classLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.className}
                </option>
              ))}
            </select>
            {errors.classLevelId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.classLevelId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher <span className="text-red-500">*</span>
            </label>
            <select
              {...register("teacherId")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">Select teacher</option>
              {staff
                .filter((s) => s.role === "Teacher")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.staffId})
                  </option>
                ))}
            </select>
            {errors.teacherId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.teacherId.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {type === "create" ? "Create Class Arm" : "Update Class Arm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassArmForm;

