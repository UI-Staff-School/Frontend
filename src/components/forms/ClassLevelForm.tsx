"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";

const schema = z.object({
  className: z.string().min(1, { message: "Class name is required!" }),
  coordinatorName: z
    .string()
    .min(1, { message: "Coordinator is required!" })
    .refine((val) => val.trim() !== "", { message: "Please select a coordinator" }),
  subjectIds: z.array(z.number()).optional().default([]),
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
  subjectId?: string;
  subjectID?: string;
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
  const [loadingStaff, setLoadingStaff] = useState(true);
  // keep raw IDs as strings for checkbox UI; convert to numbers when submitting
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Hydrate selected subjects from edit data and ensure uniqueness
  useEffect(() => {
    if (!data?.subjectIds) {
      setSelectedSubjects([]);
      return;
    }

    const subjectIdsArray = Array.isArray(data.subjectIds) ? data.subjectIds : [];
    const uniqueIds = Array.from(
      new Set(
        subjectIdsArray
          .map((id: unknown) => String(id))
          .filter((id: string) => id.trim().length > 0)
      )
    );
    setSelectedSubjects(uniqueIds as string[]);
  }, [data?.subjectIds]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingStaff(true);
        const [staffResponse, subjectsResponse] = await Promise.all([
          fetch("/api/staff"),
          fetch("/api/subject"),
        ]);

        if (staffResponse.ok) {
          const staffPayload = await staffResponse.json();
          const staffData = Array.isArray(staffPayload)
            ? staffPayload
            : staffPayload.data || [];
          console.log("Fetched staff data:", staffData);
          console.log("Total staff:", staffData.length);
          const teachers = staffData.filter((s: Staff) => 
            s.role && (s.role.toLowerCase() === "teacher" || s.role === "Teacher")
          );
          console.log("Teachers found:", teachers.length, teachers);
          setStaff(staffData);
        } else {
          console.error("Failed to fetch staff:", staffResponse.status);
        }

        if (subjectsResponse.ok) {
          const subjectsPayload = await subjectsResponse.json();
          const subjectsData = Array.isArray(subjectsPayload)
            ? subjectsPayload
            : subjectsPayload.data || [];
          setSubjects(subjectsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      className: data?.className || "",
      coordinatorName: "",
      subjectIds: [],
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Watch coordinatorName to update coordinatorId internally
  const selectedCoordinatorName = watch("coordinatorName");

  // Set coordinator name from coordinatorId when staff data is loaded (for edit mode)
  useEffect(() => {
    if (data?.coordinatorId && staff.length > 0) {
      const foundStaff = staff.find(
        (s) => 
          String(s.id || "") === String(data.coordinatorId) ||
          String(s.staffId || "") === String(data.coordinatorId)
      );
      if (foundStaff) {
        // Use id if available, otherwise use staffId
        const identifier = foundStaff.id || foundStaff.staffId;
        setValue("coordinatorName", String(identifier));
      }
    }
  }, [data?.coordinatorId, staff, setValue]);

  // Keep form subjectIds in sync with selectedSubjects state (as numbers)
  useEffect(() => {
    setValue(
      "subjectIds",
      selectedSubjects
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
    );
  }, [selectedSubjects, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      // Get coordinatorId from the selected coordinator name (which is actually the staff ID)
      // Try to match by id first, then by staffId as fallback
      const selectedStaff = staff.find(
        (s) => 
          String(s.id || "") === String(formData.coordinatorName) ||
          String(s.staffId || "") === String(formData.coordinatorName)
      );

      if (!selectedStaff) {
        throw new Error("Please select a valid coordinator.");
      }

      // Use id if available, otherwise use staffId
      const identifier = selectedStaff.id || selectedStaff.staffId;
      
      // Try to convert to number if it's numeric, otherwise use as string
      let coordinatorId: string | number;
      const coordinatorIdNum = Number(identifier);
      if (Number.isFinite(coordinatorIdNum) && coordinatorIdNum > 0) {
        coordinatorId = coordinatorIdNum;
      } else {
        // If it's a string ID like "STF-0002", use it as is
        coordinatorId = String(identifier);
      }

      // Convert subjectIds to numbers and filter out invalid ones
      const subjectIdsNum = selectedSubjects
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && id > 0);

      const payload = {
        className: formData.className,
        coordinatorId: coordinatorId, // Send as number or string, extracted from selected coordinator
        subjectIds: subjectIdsNum, // Send as array of numbers
      };

      console.log("Sending class level payload:", payload);
      console.log("Selected coordinator:", selectedStaff.firstName, selectedStaff.lastName, "ID:", coordinatorId);

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
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Backend error response:", errorData);
        throw new Error(errorData.error || errorData.message || `Failed to ${type} class level`);
      }

      const result = await response.json();
      console.log("Class level created/updated successfully:", result);
      
      // Dispatch custom event to notify other components before reload
      window.dispatchEvent(new CustomEvent("classLevelUpdated", { detail: result }));
      
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
    const id = String(subjectId);
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
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
            <Controller
              name="coordinatorName"
              control={control}
              rules={{
                required: "Coordinator is required!",
                validate: (value) => {
                  if (!value || value.trim() === "" || value === "") {
                    return "Please select a coordinator";
                  }
                  return true;
                },
              }}
              render={({ field }) => {
                // Filter teachers - be more lenient with ID checking
                const teachers = staff.filter((s) => {
                  // Check role (case-insensitive)
                  const roleStr = s.role ? String(s.role).trim() : "";
                  const isTeacher = roleStr.toLowerCase() === "teacher";
                  
                  // Check ID - accept any truthy value (string, number, etc.)
                  // Use id if available, otherwise fall back to staffId
                  const identifier = s.id || s.staffId;
                  const hasId = identifier !== undefined && identifier !== null && String(identifier).trim() !== "";
                  
                  if (isTeacher && !hasId) {
                    console.warn("Teacher found without ID:", s);
                  }
                  
                  return isTeacher && hasId;
                });

                console.log("Rendering coordinator dropdown - Teachers:", teachers.length, teachers);
                console.log("All staff for debugging:", staff);

                return (
                  <select
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingStaff}
                  >
                    <option value="">
                      {loadingStaff ? "Loading coordinators..." : "Select coordinator"}
                    </option>
                    {teachers.map((s) => {
                      // Use id if available, otherwise use staffId as fallback
                      const staffId = s.id ? String(s.id) : (s.staffId ? String(s.staffId) : "");
                      const displayName = `${s.firstName || ""} ${s.lastName || ""}${s.staffId ? ` (${s.staffId})` : ""}`.trim();
                      return (
                        <option key={staffId || `teacher-${s.firstName}-${s.lastName}`} value={staffId}>
                          {displayName || `Staff ${staffId}`}
                        </option>
                      );
                    })}
                  </select>
                );
              }}
            />
            {errors.coordinatorName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.coordinatorName.message}
              </p>
            )}
            {(() => {
              const teachers = staff.filter((s) => {
                const roleStr = s.role ? String(s.role).trim() : "";
                const isTeacher = roleStr.toLowerCase() === "teacher";
                // Use id if available, otherwise fall back to staffId
                const identifier = s.id || s.staffId;
                const hasId = identifier !== undefined && identifier !== null && String(identifier).trim() !== "";
                return isTeacher && hasId;
              });
              
              if (teachers.length === 0 && !loadingStaff) {
                const allRoles = Array.from(new Set(staff.map(s => s.role).filter(Boolean)));
                return (
                  <p className="mt-1 text-sm text-yellow-600">
                    No teachers available. Please add staff members with Teacher role first.
                    {staff.length > 0 && (
                      <span className="block text-xs mt-1">
                        Found {staff.length} staff member(s). Available roles: {allRoles.join(", ") || "none"}
                      </span>
                    )}
                  </p>
                );
              }
              return null;
            })()}
            {selectedCoordinatorName && selectedCoordinatorName.trim() !== "" && (
              <p className="mt-1 text-xs text-gray-500">
                Selected: {staff.find((s) => String(s.id) === selectedCoordinatorName)?.firstName}{" "}
                {staff.find((s) => String(s.id) === selectedCoordinatorName)?.lastName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subjects
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((subject) => {
                  const subjectIdStr = String(subject.id ?? subject.subjectId ?? subject.subjectID ?? "");
                  const isChecked = selectedSubjects.includes(subjectIdStr);
                  return (
                    <label
                      key={subjectIdStr || subject.subjectName}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSubject(subjectIdStr)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {subject.subjectName}
                      </span>
                    </label>
                  );
                })}
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

