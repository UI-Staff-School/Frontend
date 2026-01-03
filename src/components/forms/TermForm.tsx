"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, { message: "Term name is required!" }),
  sessionId: z.coerce.number().min(1, { message: "Session is required!" }),
  startDate: z.string().min(1, { message: "Start date is required!" }),
  endDate: z.string().min(1, { message: "End date is required!" }),
});

type Inputs = z.infer<typeof schema>;

const TermForm = ({
  type,
  data,
  sessionId,
}: {
  type: "create" | "update";
  data?: any;
  sessionId?: number | string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data
      ? {
          name: data.name || data.termName || "",
          sessionId: data.sessionId || sessionId || 0,
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().split("T")[0]
            : "",
          endDate: data.endDate
            ? new Date(data.endDate).toISOString().split("T")[0]
            : "",
        }
      : {
          name: "",
          sessionId: sessionId ? Number(sessionId) : 0,
          startDate: "",
          endDate: "",
        },
  });

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const url =
        type === "create"
          ? "/api/session/create-term"
          : `/api/session/term/${data?.id}`;
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
        throw new Error(errorData.error || `Failed to ${type} term`);
      }

      window.location.reload();
    } catch (error: any) {
      console.error(
        `Error ${type === "create" ? "creating" : "updating"} term:`,
        error.message
      );
      alert(error.message || `Failed to ${type} term`);
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="text-center border-b border-gray-200 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">
              {type === "create" ? "+" : "✏️"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {type === "create" ? "Add New Term" : "Update Term"}
          </h1>
          <p className="text-gray-600 mt-2">
            {type === "create"
              ? "Create a new term for this session"
              : "Update the term information below"}
          </p>
        </div>

        {/* Form Fields */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6">
          <div className="space-y-6">
            {/* Hidden Session ID for create */}
            <input type="hidden" {...register("sessionId")} />

            {/* Term Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g., First Term, Second Term"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register("startDate")}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                {...register("endDate")}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endDate.message}
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
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {type === "create" ? "Create Term" : "Update Term"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TermForm;
