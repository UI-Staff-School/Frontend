"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { normalizeClassLevels } from "@/lib/class-level-utils";

const schema = z.object({
  armName: z.string().min(1, { message: "Arm name is required!" }),
  classLevelId: z.union([z.string(), z.number()]).refine(
    (val) => {
      // Convert to string first to handle both types
      const strVal = String(val);
      // Check if it's not empty
      if (!strVal || strVal.trim() === "" || strVal === "0") {
        return false;
      }
      // Check if it's not a temporary placeholder
      if (strVal.startsWith("temp-")) {
        return false;
      }
      // Try to convert to number and check if it's valid
      const num = Number(strVal);
      // Accept if it's a valid positive number OR a non-empty string (for string IDs)
      return (!isNaN(num) && num > 0) || strVal.trim().length > 0;
    },
    { message: "Please select a valid class level!" }
  ),
  teacherId: z.string().min(1, { message: "Teacher ID is required!" }),
});

type Inputs = z.infer<typeof schema>;

type ClassLevel = {
  id?: string | number;
  className?: string;
  [key: string]: any; // Allow other properties from API
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingLevels(true);
        setLoadingStaff(true);

        // Add cache-busting timestamp to ensure fresh data
        const timestamp = new Date().getTime();
        const [levelsResponse, staffResponse] = await Promise.all([
          fetch(`/api/class/level?t=${timestamp}`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
            credentials: "include",
          }),
          fetch(`/api/staff?t=${timestamp}`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
            credentials: "include",
          }),
        ]);

        // Handle class levels response
        if (levelsResponse.ok) {
          const levelsPayload = await levelsResponse.json();
          console.log("ClassArmForm - Raw levels payload:", levelsPayload);
          console.log("ClassArmForm - Payload type:", typeof levelsPayload);
          console.log("ClassArmForm - Is array?", Array.isArray(levelsPayload));

          // Handle different response formats
          let levelsData: ClassLevel[] = [];
          if (Array.isArray(levelsPayload)) {
            levelsData = levelsPayload;
          } else if (levelsPayload && Array.isArray(levelsPayload.data)) {
            levelsData = levelsPayload.data;
          } else if (levelsPayload && levelsPayload.error) {
            console.error(
              "ClassArmForm - API returned error:",
              levelsPayload.error
            );
            levelsData = [];
          } else {
            console.warn(
              "ClassArmForm - Unexpected response format:",
              levelsPayload
            );
            levelsData = [];
          }

          // Normalize the data - ensure all class levels have an 'id' field
          // The API route should already normalize this, but we'll do it here as a safety measure
          levelsData = normalizeClassLevels(levelsData);

          console.log("ClassArmForm - Processed class levels:", levelsData);
          console.log("ClassArmForm - Total class levels:", levelsData.length);

          if (levelsData.length > 0) {
            console.log(
              "ClassArmForm - Sample class level structure:",
              levelsData[0]
            );
            // Log each level's structure for debugging
            levelsData.forEach((level: ClassLevel, index: number) => {
              console.log(`ClassArmForm - Level ${index}:`, {
                id: level.id,
                idType: typeof level.id,
                className: level.className,
                allKeys: Object.keys(level),
                hasId: level.id !== undefined && level.id !== null,
              });
            });

            // Count how many have valid IDs
            const withValidIds = levelsData.filter(
              (l) => l.id !== undefined && l.id !== null
            );
            console.log(
              `ClassArmForm - Class levels with valid IDs: ${withValidIds.length} out of ${levelsData.length}`
            );

            if (withValidIds.length < levelsData.length) {
              console.warn(
                "ClassArmForm - Some class levels are missing IDs. This will prevent them from being used in class arms."
              );
            }
          } else {
            console.warn("ClassArmForm - No class levels found in response");
          }

          setClassLevels(levelsData);
        } else {
          const errorText = await levelsResponse.text();
          console.error("ClassArmForm - Failed to fetch class levels:", {
            status: levelsResponse.status,
            statusText: levelsResponse.statusText,
            error: errorText,
          });
          setClassLevels([]);
        }

        // Handle staff response
        if (staffResponse.ok) {
          const staffPayload = await staffResponse.json();
          const staffData = Array.isArray(staffPayload)
            ? staffPayload
            : staffPayload.data || [];
          console.log("ClassArmForm - Fetched staff data:", staffData);
          console.log("ClassArmForm - Total staff:", staffData.length);
          const teachers = staffData.filter((s: Staff) => {
            const roleStr = s.role ? String(s.role).trim() : "";
            return roleStr.toLowerCase() === "teacher";
          });
          console.log(
            "ClassArmForm - Teachers found:",
            teachers.length,
            teachers
          );
          setStaff(staffData);
        } else {
          const errorText = await staffResponse.text();
          console.error("ClassArmForm - Failed to fetch staff:", {
            status: staffResponse.status,
            statusText: staffResponse.statusText,
            error: errorText,
          });
          setStaff([]);
        }
      } catch (error) {
        console.error("ClassArmForm - Error fetching data:", error);
        setClassLevels([]);
        setStaff([]);
      } finally {
        setLoadingLevels(false);
        setLoadingStaff(false);
      }
    };

    fetchData();
  }, [refreshKey]); // Refetch when refreshKey changes

  // Function to manually refresh data (can be called if needed)
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Listen for class level updates to refresh the dropdown
  useEffect(() => {
    const handleClassLevelUpdate = () => {
      console.log("ClassArmForm - Class level updated, refreshing data...");
      refreshData();
    };

    window.addEventListener("classLevelUpdated", handleClassLevelUpdate);

    return () => {
      window.removeEventListener("classLevelUpdated", handleClassLevelUpdate);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    mode: "onChange", // Validate on change for better UX
    defaultValues: data
      ? {
          armName: data.armName || "",
          classLevelId: data.classLevelId ? String(data.classLevelId) : "",
          teacherId: data.teacherId || "",
        }
      : {
          armName: "",
          classLevelId: "",
          teacherId: "",
        },
  });

  // Set teacherId from data when staff data is loaded (for edit mode)
  useEffect(() => {
    if (data?.teacherId && staff.length > 0) {
      const foundTeacher = staff.find(
        (s) =>
          String(s.id || "") === String(data.teacherId) ||
          String(s.staffId || "") === String(data.teacherId)
      );
      if (foundTeacher) {
        // Use id if available, otherwise use staffId
        const identifier = foundTeacher.id || foundTeacher.staffId;
        setValue("teacherId", String(identifier));
      }
    }
  }, [data?.teacherId, staff, setValue]);

  // Set classLevelId from data when classLevels data is loaded (for edit mode)
  useEffect(() => {
    if (data?.classLevelId && classLevels.length > 0) {
      const levelId = String(data.classLevelId);
      setValue("classLevelId", levelId);
    }
  }, [data?.classLevelId, classLevels, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      // Find the selected teacher to get their proper ID
      const selectedTeacher = staff.find(
        (s) =>
          String(s.id || "") === String(formData.teacherId) ||
          String(s.staffId || "") === String(formData.teacherId)
      );

      if (!selectedTeacher) {
        throw new Error("Please select a valid teacher.");
      }

      // Use id if available, otherwise use staffId
      const teacherId = selectedTeacher.id || selectedTeacher.staffId;

      // Debug: Log what we're trying to match
      console.log("ClassArmForm - Attempting to find class level:", {
        formDataClassLevelId: formData.classLevelId,
        formDataType: typeof formData.classLevelId,
        availableClassLevels: classLevels.map((level) => ({
          id: level.id,
          idType: typeof level.id,
          className: level.className,
        })),
      });

      // Convert formData.classLevelId to string for comparison
      const formClassLevelIdStr = String(formData.classLevelId);
      console.log(
        "ClassArmForm - Looking for class level with form value:",
        formClassLevelIdStr
      );
      console.log(
        "ClassArmForm - Form value type:",
        typeof formData.classLevelId
      );

      // Reject temporary placeholder IDs
      if (
        formClassLevelIdStr.startsWith("index-") ||
        formClassLevelIdStr.startsWith("temp-")
      ) {
        throw new Error(
          "Please select a valid class level. The selected class level does not have a valid ID."
        );
      }

      // Find the selected class level to get its proper ID
      // Try exact string match first
      let selectedClassLevel = classLevels.find((level) => {
        if (!level || level.id === undefined || level.id === null) return false;
        const levelIdStr = String(level.id);
        return levelIdStr === formClassLevelIdStr;
      });

      // If not found, try numeric comparison (in case of type mismatch)
      if (!selectedClassLevel) {
        const formIdNum = Number(formClassLevelIdStr);
        if (!isNaN(formIdNum) && formIdNum > 0) {
          selectedClassLevel = classLevels.find((level) => {
            if (!level || level.id === undefined || level.id === null)
              return false;
            const levelIdNum = Number(level.id);
            return !isNaN(levelIdNum) && levelIdNum === formIdNum;
          });
        }
      }

      console.log(
        "ClassArmForm - Selected class level found:",
        selectedClassLevel
      );
      console.log(
        "ClassArmForm - Available class levels:",
        classLevels.map((l) => ({
          id: l.id,
          idType: typeof l.id,
          className: l.className,
        }))
      );

      if (
        !selectedClassLevel ||
        selectedClassLevel.id === undefined ||
        selectedClassLevel.id === null
      ) {
        console.error(
          "ClassArmForm - Could not find class level with ID:",
          formData.classLevelId
        );
        console.error(
          "ClassArmForm - This might indicate a mismatch between the dropdown value and the actual class level IDs"
        );
        throw new Error(
          `Please select a valid class level. Could not find class level with ID: ${formData.classLevelId}`
        );
      }

      // Get the class level ID - convert to number if it's numeric
      let classLevelId: number;
      const levelIdNum = Number(selectedClassLevel.id);
      if (!isNaN(levelIdNum) && levelIdNum > 0) {
        classLevelId = levelIdNum;
      } else {
        // If it's not a valid number, try to use it as-is (might be a string ID)
        const levelIdStr = String(selectedClassLevel.id);
        if (levelIdStr.trim().length > 0) {
          // Backend might accept string IDs, but let's try to convert to number first
          throw new Error(
            `Invalid class level ID format: ${selectedClassLevel.id}. Expected a numeric ID.`
          );
        } else {
          throw new Error(`Invalid class level ID: ${selectedClassLevel.id}`);
        }
      }

      console.log(
        "ClassArmForm - Final classLevelId to send:",
        classLevelId,
        "type:",
        typeof classLevelId
      );

      const payload = {
        armName: formData.armName,
        classLevelId: classLevelId, // Use the proper ID from the selected class level
        teacherId: teacherId, // Use the proper ID from the selected teacher
      };

      console.log("Sending class arm payload:", payload);
      console.log(
        "Selected class level:",
        selectedClassLevel.className,
        "ID:",
        classLevelId
      );
      console.log(
        "Selected teacher:",
        selectedTeacher.firstName,
        selectedTeacher.lastName,
        "ID:",
        teacherId
      );

      // Get the ID - backend may return 'id', 'classArmId', or 'armId'
      const armId = data?.id || data?.classArmId || data?.armId;

      if (type === "update") {
        if (!armId) {
          console.error("ClassArmForm - Missing ID for update:", {
            data,
            allKeys: data ? Object.keys(data) : [],
          });
          throw new Error(
            "Cannot update class arm: Missing ID. Please refresh the page and try again."
          );
        }

        // Validate ID is not NaN
        const idNum = Number(armId);
        if (isNaN(idNum) || idNum <= 0) {
          console.error("ClassArmForm - Invalid ID for update:", {
            armId,
            idNum,
            data,
          });
          throw new Error(
            `Cannot update class arm: Invalid ID (${armId}). Please refresh the page and try again.`
          );
        }
      }

      const url =
        type === "create" ? "/api/class/arms" : `/api/class/arms/${armId}`;
      const method = type === "create" ? "POST" : "PUT";

      console.log("ClassArmForm - Request details:", {
        type,
        url,
        armId,
        armIdType: typeof armId,
        payload,
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Backend error response:", errorData);
        throw new Error(
          errorData.error || errorData.message || `Failed to ${type} class arm`
        );
      }

      const result = await response.json();
      console.log("Class arm created/updated successfully:", result);
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
              {type === "create" ? "+" : "Edit"}
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
            <Controller
              name="classLevelId"
              control={control}
              rules={{
                required: "Class level is required!",
                validate: (value) => {
                  const strVal = String(value);
                  if (!strVal || strVal.trim() === "" || strVal === "0") {
                    return "Please select a valid class level!";
                  }
                  if (strVal.startsWith("temp-")) {
                    return "Please select a valid class level!";
                  }
                  return true;
                },
              }}
              render={({ field }) => {
                // Log all class levels for debugging
                console.log(
                  "ClassArmForm - All class levels for dropdown:",
                  classLevels
                );
                classLevels.forEach((level, idx) => {
                  console.log(`ClassArmForm - Level ${idx}:`, {
                    id: level.id,
                    idType: typeof level.id,
                    className: level.className,
                    hasId: level.id !== undefined && level.id !== null,
                    idString: level.id ? String(level.id) : "none",
                  });
                });

                // Filter to only include levels with valid IDs (required for linking)
                // We MUST have an ID to link the class arm to the class level
                const validLevels = classLevels.filter((level) => {
                  // Must have a level object
                  if (!level) {
                    console.log(
                      "ClassArmForm - Filtered out: null/undefined level"
                    );
                    return false;
                  }

                  // MUST have an ID - we can't link without it
                  const hasId = level.id !== undefined && level.id !== null;
                  if (!hasId) {
                    console.log(
                      "ClassArmForm - Filtered out: no ID (required for linking)",
                      {
                        className: level.className,
                      }
                    );
                    return false;
                  }

                  const levelIdStr = String(level.id).trim();

                  // Reject empty, zero, or temporary placeholder IDs
                  if (
                    levelIdStr === "" ||
                    levelIdStr === "0" ||
                    levelIdStr.startsWith("temp-")
                  ) {
                    console.log(
                      "ClassArmForm - Filtered out: invalid ID format",
                      {
                        id: level.id,
                        idStr: levelIdStr,
                        className: level.className,
                      }
                    );
                    return false;
                  }

                  // Try to convert to number - if it's a valid positive number, great
                  // If it's a non-numeric string ID, that's also OK as long as it's not empty
                  const numericId = Number(levelIdStr);
                  const isValidNumeric = !isNaN(numericId) && numericId > 0;
                  const isValidString =
                    levelIdStr.length > 0 && !levelIdStr.startsWith("temp-");

                  if (isValidNumeric || isValidString) {
                    console.log(
                      "ClassArmForm - Including level with valid ID:",
                      {
                        id: level.id,
                        idStr: levelIdStr,
                        numericId: isValidNumeric
                          ? numericId
                          : "N/A (string ID)",
                        className: level.className,
                      }
                    );
                    return true;
                  }

                  console.log(
                    "ClassArmForm - Filtered out: ID failed validation",
                    {
                      id: level.id,
                      idStr: levelIdStr,
                      className: level.className,
                    }
                  );
                  return false;
                });

                console.log(
                  "ClassArmForm - Valid levels after filtering:",
                  validLevels.length,
                  validLevels
                );

                return (
                  <>
                    <select
                      {...field}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      disabled={loadingLevels}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log(
                          "ClassArmForm - Class level selected:",
                          value
                        );
                        field.onChange(value);
                      }}
                    >
                      <option value="">
                        {loadingLevels
                          ? "Loading class levels..."
                          : "Select class level"}
                      </option>
                      {!loadingLevels && validLevels.length === 0 && (
                        <option value="" disabled>
                          No class levels available
                        </option>
                      )}
                      {!loadingLevels &&
                        validLevels
                          .filter((level) => {
                            // Only include levels with actual IDs (no fallback)
                            return (
                              level.id !== undefined &&
                              level.id !== null &&
                              String(level.id).trim() !== ""
                            );
                          })
                          .map((level, index) => {
                            // Must have a valid ID at this point
                            const levelId = String(level.id!);
                            const displayName =
                              level.className || `Class Level ${levelId}`;

                            console.log(`ClassArmForm - Rendering option:`, {
                              levelId,
                              displayName,
                              originalId: level.id,
                              idType: typeof level.id,
                            });

                            return (
                              <option key={levelId} value={levelId}>
                                {displayName}
                              </option>
                            );
                          })}
                    </select>
                    {errors.classLevelId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.classLevelId.message}
                      </p>
                    )}
                    {!loadingLevels &&
                      validLevels.length === 0 &&
                      classLevels.length > 0 && (
                        <div className="mt-1 text-sm text-yellow-600">
                          <p className="font-semibold">
                            WARNING: No valid class levels found. Please ensure
                            class levels have valid IDs.
                          </p>
                          <p className="text-xs mt-1">
                            Found {classLevels.length} class level(s) but none
                            have valid IDs. This usually means:
                          </p>
                          <ul className="text-xs mt-1 list-disc list-inside space-y-1">
                            <li>
                              The backend isn&apos;t returning ID fields in the
                              response
                            </li>
                            <li>
                              Class levels were created before IDs were properly
                              configured
                            </li>
                            <li>
                              The ID field has a different name (check console
                              logs)
                            </li>
                          </ul>
                          <p className="text-xs mt-2 font-semibold">
                            Solution: Check the browser console for detailed
                            logs showing the actual data structure. You may need
                            to recreate the class levels or fix the backend to
                            return IDs.
                          </p>
                        </div>
                      )}
                    {!loadingLevels && classLevels.length === 0 && (
                      <p className="mt-1 text-sm text-yellow-600">
                        No class levels available. Please create a class level
                        first.
                      </p>
                    )}
                  </>
                );
              }}
            />
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
                .filter((s) => {
                  // More flexible role matching (case-insensitive)
                  const roleStr = s.role ? String(s.role).trim() : "";
                  const isTeacher = roleStr.toLowerCase() === "teacher";
                  // Use id if available, otherwise fall back to staffId
                  const identifier = s.id || s.staffId;
                  const hasId =
                    identifier !== undefined &&
                    identifier !== null &&
                    String(identifier).trim() !== "";
                  return isTeacher && hasId;
                })
                .map((s) => {
                  // Use id if available, otherwise use staffId as fallback
                  const teacherId = s.id
                    ? String(s.id)
                    : s.staffId
                    ? String(s.staffId)
                    : "";
                  const displayName = `${s.firstName || ""} ${
                    s.lastName || ""
                  }${s.staffId ? ` (${s.staffId})` : ""}`.trim();
                  return (
                    <option
                      key={teacherId || `teacher-${s.firstName}-${s.lastName}`}
                      value={teacherId}
                    >
                      {displayName || `Staff ${teacherId}`}
                    </option>
                  );
                })}
            </select>
            {errors.teacherId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.teacherId.message}
              </p>
            )}
            {staff.filter((s) => {
              const roleStr = s.role ? String(s.role).trim() : "";
              const isTeacher = roleStr.toLowerCase() === "teacher";
              const identifier = s.id || s.staffId;
              const hasId =
                identifier !== undefined &&
                identifier !== null &&
                String(identifier).trim() !== "";
              return isTeacher && hasId;
            }).length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                No teachers available. Please add staff members with Teacher
                role first.
                {staff.length > 0 && (
                  <span className="block text-xs mt-1">
                    Found {staff.length} staff member(s). Available roles:{" "}
                    {Array.from(
                      new Set(staff.map((s) => s.role).filter(Boolean))
                    ).join(", ") || "none"}
                  </span>
                )}
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
