"use client";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Staff = {
  id: string;
  _id?: string;
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  religion: string;
  role: string;
  qualification: string;
  dateOfBirth: string;
};

type ClassArm = {
  id: number;
  name?: string;
  armName?: string;
  teacherId?: string;
  classLevelId?: number;
  classLevel?: {
    id: number;
    name?: string;
    className?: string;
  };
};

type ClassLevel = {
  id: number;
  name?: string;
  className?: string;
};

const SingleTeacherPage = () => {
  const params = useParams();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<ClassArm[]>([]);
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch staff, class arms, and class levels in parallel
        const [staffRes, classArmsRes, classLevelsRes] = await Promise.all([
          fetch(`/api/staff/${params.id}`, { credentials: "include" }),
          fetch("/api/class/arms", { credentials: "include" }),
          fetch("/api/class/level", { credentials: "include" }),
        ]);

        if (!staffRes.ok) {
          throw new Error("Failed to fetch staff member");
        }

        const staffData = await staffRes.json();

        // Check if we got an error response
        if (staffData.error) {
          throw new Error(staffData.error);
        }

        // Normalize - ensure staff has an id
        const normalizedStaff = {
          ...staffData,
          id: String(staffData.id || staffData.staffId || staffData._id || params.id),
          staffId: staffData.staffId || String(params.id),
        };

        setStaff(normalizedStaff);

        // Handle class arms - find classes assigned to this staff
        if (classArmsRes.ok) {
          const armsData = await classArmsRes.json();
          const armsArray = Array.isArray(armsData) ? armsData : [];

          // Filter to find classes where this staff is the teacher
          const assignedArms = armsArray.filter(
            (arm: ClassArm) =>
              String(arm.teacherId) === String(normalizedStaff.id) ||
              String(arm.teacherId) === String(normalizedStaff.staffId)
          );

          setAssignedClasses(assignedArms);
        }

        // Handle class levels
        if (classLevelsRes.ok) {
          const levelsData = await classLevelsRes.json();
          setClassLevels(Array.isArray(levelsData) ? levelsData : []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Helper function to get class name
  const getClassName = (classArm: ClassArm): string => {
    // Try to get from nested classLevel
    let levelName =
      classArm.classLevel?.className || classArm.classLevel?.name || "";

    // If no nested classLevel, look up in classLevels array
    if (!levelName && classArm.classLevelId) {
      const classLevel = classLevels.find(
        (level) => level.id === classArm.classLevelId
      );
      levelName = classLevel?.className || classLevel?.name || "";
    }

    const armName = classArm.armName || classArm.name || "";

    if (levelName && armName) return `${levelName} ${armName}`;
    if (levelName) return levelName;
    if (armName) return armName;
    return `Class ${classArm.id}`;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lamaPurple mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff member...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">
              Error: {error || "Staff member not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-lamaPurple text-white rounded-md hover:bg-lamaPurpleDark"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>←</span>
        <span>Back to Staff</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT - Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Card */}
          <div className="bg-gradient-to-r from-lamaPurpleLight to-lamaPurple/20 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-lamaPurple">
                    {staff.firstName?.charAt(0) || ""}
                    {staff.lastName?.charAt(0) || ""}
                  </span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {staff.firstName} {staff.lastName}
                  </h1>
                  {role === "admin" && (
                    <FormModal table="teacher" type="update" data={staff} />
                  )}
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-gray-700">
                    {staff.staffId}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 rounded-full text-sm font-medium text-purple-800">
                    {staff.role}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      staff.gender === "Male"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-pink-100 text-pink-800"
                    }`}
                  >
                    {staff.gender}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium truncate">{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium">{staff.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-gray-500">DOB:</span>
                    <span className="font-medium">
                      {staff.dateOfBirth
                        ? new Date(staff.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-purple-600">{staff.role}</div>
              <div className="text-xs text-gray-500 mt-1">Position</div>
            </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Classes</div>
            </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Qualification</div>
            </div>
                {staff.religion}
              </div>
              <div className="text-xs text-gray-500 mt-1">Religion</div>
            </div>
          </div>

                </div>
                <p className="text-gray-700 font-medium">{staff.staffId}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">R</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Role</h3>
                </div>
                <p className="text-gray-700 font-medium">{staff.role}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">Q</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Qualification</h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {staff.qualification || "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">G</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Gender</h3>
                </div>
                <p className="text-gray-700 font-medium">{staff.gender}</p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">R</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Religion</h3>
                </div>
                <p className="text-gray-700 font-medium">{staff.religion}</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">D</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Date of Birth</h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {staff.dateOfBirth
                    ? new Date(staff.dateOfBirth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact Information */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">E</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 break-words">
                    {staff.email || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm">P</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">
                    {staff.phoneNumber || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-sm">A</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900 break-words">
                    {staff.address || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {staff.email && (
                <a
                  href={`mailto:${staff.email}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <span className="text-green-600">E</span>
                  <span className="text-gray-700">Send Email</span>
                </a>
              )}
              {staff.phoneNumber && (
                <a
                  href={`tel:${staff.phoneNumber}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <span className="text-blue-600">P</span>
                  <span className="text-gray-700">Call Staff</span>
                </a>
              )}
              <Link
                href="/list/classes"
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <span className="text-purple-600">C</span>
                <span className="text-gray-700">Manage Classes</span>
              </Link>
              {role === "admin" && (
                <FormModal
                  table="teacher"
                  type="delete"
                  id={staff.id}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTeacherPage;
