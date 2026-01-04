"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { showError, showSuccess } from "@/lib/toast";

const schema = z.object({
  name: z.string().min(1, { message: "Fee name is required!" }),
  amount: z.coerce.number().min(1, { message: "Amount must be greater than 0!" }),
  description: z.string().optional(),
  termId: z.coerce.number().min(1, { message: "Term is required!" }),
  classLevelId: z.coerce.number().optional(),
  dueDate: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

interface Term {
  id: number | string;
  name: string;
  year?: string;
}

interface ClassLevel {
  id: number | string;
  name: string;
}

const FeeForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data?: any;
}) => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data
      ? {
          name: data.name || data.feeName || "",
          amount: data.amount || 0,
          description: data.description || "",
          termId: data.termId || data.term?.id || 0,
          classLevelId: data.classLevelId || data.classLevel?.id || undefined,
          dueDate: data.dueDate
            ? new Date(data.dueDate).toISOString().split("T")[0]
            : "",
        }
      : {
          name: "",
          amount: 0,
          description: "",
          termId: 0,
          classLevelId: undefined,
          dueDate: "",
        },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [termsRes, classesRes] = await Promise.all([
          fetch("/api/terms", { credentials: "include" }),
          fetch("/api/class/level", { credentials: "include" }),
        ]);

        if (termsRes.ok) {
          const termsData = await termsRes.json();
          setTerms(Array.isArray(termsData?.terms) ? termsData.terms : []);
        }

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          setClassLevels(Array.isArray(classesData) ? classesData : []);
        }
      } catch (err) {
        console.error("Error fetching form data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const url =
        type === "create" ? "/api/payment/fee" : `/api/payment/fee/${data?.id}`;
      const method = type === "create" ? "POST" : "PUT";

      // Clean up payload
      const payload: any = {
        name: formData.name,
        amount: formData.amount,
        termId: formData.termId,
      };

      if (formData.description) payload.description = formData.description;
      if (formData.classLevelId) payload.classLevelId = formData.classLevelId;
      if (formData.dueDate) payload.dueDate = formData.dueDate;

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
        let errorMessage = `Failed to ${type} fee`;
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage;
        } catch {
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      showSuccess(`Fee ${type === "create" ? "created" : "updated"} successfully`);
      window.location.reload();
    } catch (error: any) {
      showError(error.message || `Failed to ${type} fee`);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="text-center border-b border-gray-200 pb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">
              {type === "create" ? "+" : "✏️"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {type === "create" ? "Create New Fee" : "Update Fee"}
          </h1>
          <p className="text-gray-600 mt-2">
            {type === "create"
              ? "Define a new fee structure"
              : "Update the fee information below"}
          </p>
        </div>

        {/* Form Fields */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="space-y-6">
            {/* Fee Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fee Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder="e.g., School Fees, Lab Fee, Sports Fee"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (NGN) <span className="text-red-500">*</span>
              </label>
              <input
                {...register("amount")}
                type="number"
                placeholder="e.g., 50000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term <span className="text-red-500">*</span>
              </label>
              <select
                {...register("termId")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name} {term.year ? `(${term.year})` : ""}
                  </option>
                ))}
              </select>
              {errors.termId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.termId.message}
                </p>
              )}
            </div>

            {/* Class Level (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Level <span className="text-gray-400">(Optional)</span>
              </label>
              <select
                {...register("classLevelId")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Classes</option>
                {classLevels.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to apply to all classes
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Brief description of this fee..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                {...register("dueDate")}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            {type === "create" ? "Create Fee" : "Update Fee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeeForm;
