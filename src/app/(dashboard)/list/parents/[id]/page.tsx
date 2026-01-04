"use client";
import FormModal from "@/components/FormModal";
import { role } from "@/lib/data";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type LinkedStudent = {
  id?: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  classArm?: {
    id: number;
    name?: string;
    armName?: string;
    classLevel?: {
      id: number;
      name?: string;
      className?: string;
    };
  };
};

type Parent = {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  occupation?: string;
  relationship?: string;
  gender?: string;
  students?: LinkedStudent[];
};

const SingleParentPage = () => {
  const params = useParams();
  const router = useRouter();
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const parentRes = await fetch(`/api/parent/${params.id}`, {
          credentials: "include",
        });

        if (!parentRes.ok) {
          throw new Error("Failed to fetch parent");
        }

        const parentData = await parentRes.json();

        // Check if we got an error response
        if (parentData.error) {
          throw new Error(parentData.error);
        }

        // Normalize - ensure parent has an id
        const normalizedParent = {
          ...parentData,
          id: String(parentData.id || parentData._id || params.id),
        };

        setParent(normalizedParent);
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

  // Helper function to get class name for a student
  const getClassName = (student: LinkedStudent): string => {
    if (student.classArm) {
      const levelName =
        student.classArm.classLevel?.className ||
        student.classArm.classLevel?.name ||
        "";
      const armName = student.classArm.armName || student.classArm.name || "";
      if (levelName && armName) return `${levelName} ${armName}`;
      if (levelName) return levelName;
      if (armName) return armName;
    }
    return "N/A";
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading parent...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !parent) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">
              Error: {error || "Parent not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
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
        <span>&larr;</span>
        <span>Back to Parents</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT - Main Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile Card */}
          <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-teal-600">
                    {parent.firstName?.charAt(0) || ""}
                    {parent.lastName?.charAt(0) || ""}
                  </span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {parent.firstName} {parent.lastName}
                  </h1>
                  {role === "admin" && (
                    <FormModal table="parent" type="update" data={parent} />
                  )}
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  {parent.relationship && (
                    <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-sm font-medium">
                      {parent.relationship}
                    </span>
                  )}
                  {parent.occupation && (
                    <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-gray-700">
                      {parent.occupation}
                    </span>
                  )}
                  {parent.gender && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        parent.gender === "Male"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-pink-100 text-pink-800"
                      }`}
                    >
                      {parent.gender}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium truncate">{parent.email}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium">{parent.phoneNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-teal-600">
                {parent.students?.length || 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">Children</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-blue-600 text-lg truncate">
                {parent.relationship || "N/A"}
              </div>
              <div className="text-xs text-gray-500 mt-1">Relationship</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-purple-600 text-lg truncate">
                {parent.occupation || "N/A"}
              </div>
              <div className="text-xs text-gray-500 mt-1">Occupation</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-xs text-gray-500 mt-1">Status</div>
            </div>
          </div>

          {/* Linked Children */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Linked Children
              </h2>
              <Link
                href="/list/students"
                className="text-sm text-teal-600 hover:underline"
              >
                View All Students
              </Link>
            </div>
            {parent.students && parent.students.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parent.students.map((student) => (
                  <Link
                    key={student.admissionNo}
                    href={`/list/students/${student.id || student.admissionNo}`}
                    className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {student.firstName?.charAt(0) || ""}
                          {student.lastName?.charAt(0) || ""}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.admissionNo}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                          {getClassName(student)}
                        </span>
                      </div>
                      <div className="text-gray-400">&rarr;</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-gray-400">?</span>
                </div>
                <p>No children linked</p>
                <p className="text-sm mt-1">
                  Link students to this parent in the student profile
                </p>
              </div>
            )}
          </div>

          {/* Parent Details */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Parent Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">N</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Full Name</h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {parent.firstName} {parent.lastName}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">R</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Relationship</h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {parent.relationship || "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">O</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Occupation</h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {parent.occupation || "N/A"}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">C</span>
                  </div>
                  <h3 className="font-medium text-gray-900">Children Count</h3>
                </div>
                <p className="text-gray-700 font-medium">
                  {parent.students?.length || 0} student(s)
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
                    {parent.email || "N/A"}
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
                    {parent.phoneNumber || "N/A"}
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
                    {parent.address || "N/A"}
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
              {parent.email && (
                <a
                  href={`mailto:${parent.email}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <span className="text-green-600">E</span>
                  <span className="text-gray-700">Send Email</span>
                </a>
              )}
              {parent.phoneNumber && (
                <a
                  href={`tel:${parent.phoneNumber}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <span className="text-blue-600">P</span>
                  <span className="text-gray-700">Call Parent</span>
                </a>
              )}
              {parent.phoneNumber && (
                <a
                  href={`https://wa.me/${parent.phoneNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <span className="text-emerald-600">W</span>
                  <span className="text-gray-700">WhatsApp</span>
                </a>
              )}
              <Link
                href="/list/students"
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <span className="text-purple-600">S</span>
                <span className="text-gray-700">View Students</span>
              </Link>
              {role === "admin" && (
                <FormModal table="parent" type="delete" id={parent.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleParentPage;
