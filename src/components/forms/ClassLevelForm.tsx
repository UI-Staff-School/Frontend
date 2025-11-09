"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

const schema = z.object({
  className: z.string().min(1, { message: "Class name is required!" }),
  coordinatorId: z.string().min(1, { message: "Coordinator ID is required!" }),
  subjectIds: z.array(z.number()).optional(),
});

type Inputs = z.infer<typeof schema>;

type Staff = {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  role: string;
};

type Subject = {
  id: string;
  subjectName: string;
};

const ClassLevelForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  useEffect(() => {
    if (data?.subjectIds) {
      setSelectedSubjects(
        data.subjectIds.map((id: any) => (typeof id === "string" ? parseInt(id) : id))
      );
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffResponse, subjectsResponse] = await Promise.all([
          fetch("/api/staff"),
          fetch("/api/subject"),
        ]);

        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          setStaff(Array.isArray(staffData) ? staffData : []);
        }

        if (subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
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
    defaultValues: data || {
      className: "",
      coordinatorId: "",
      subjectIds: [],
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const payload = {
        ...formData,
        subjectIds: selectedSubjects,
      };

      const url =
        type === "create"
          ? "/api/class/level"
          : `/api/class/level/${data?.id}`;
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
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${type} class level`);
      }

      window.location.reload();
    } catch (error: any) {
      console.error(
        `Error ${type === "create" ? "creating" : "updating"} class level:`,
        error.message
      );
      alert(error.message || `Failed to ${type} class level`);
    }
  });

  const toggleSubject = (subjectId: string) => {
    const id = parseInt(subjectId);
    setSelectedSubjects((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="text-center border-b border-gray-200 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">
              {type === "create" ? "+" : "✏️"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {type === "create" ? "Add New Class Level" : "Update Class Level"}
          </h1>
          <p className="text-gray-600 mt-2">
            {type === "create"
              ? "Fill in the details to create a new class level"
              : "Update the class level information below"}
          </p>
        </div>

        {/* Form Fields */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("className")}
              type="text"
              placeholder="Enter class name (e.g., Primary 1, JSS 1)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.className && (
              <p className="mt-1 text-sm text-red-600">
                {errors.className.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coordinator <span className="text-red-500">*</span>
            </label>
            <select
              {...register("coordinatorId")}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select coordinator</option>
              {staff
                .filter((s) => s.role === "Teacher" || s.role === "Admin")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.staffId})
                  </option>
                ))}
            </select>
            {errors.coordinatorId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.coordinatorId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <label
                    key={subject.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(parseInt(subject.id))}
                      onChange={() => toggleSubject(subject.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {subject.subjectName}
                    </span>
                  </label>
                ))}
              </div>
              {subjects.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No subjects available
                </p>
              )}
            </div>
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
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {type === "create" ? "Create Class Level" : "Update Class Level"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassLevelForm;

