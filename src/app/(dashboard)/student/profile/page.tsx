"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Student {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  address?: string;
  stateOfOrigin?: string;
  localGovernment?: string;
  nationality?: string;
  bloodGroup?: string;
  genotype?: string;
  yearOfAdmission?: string;
  classArm?: {
    id: string | number;
    name: string;
    classLevel?: {
      id: string | number;
      name: string;
    };
  };
  parents?: Array<{
    id: string | number;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    occupation?: string;
    relationship?: string;
  }>;
}

const StudentProfilePage = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/student/me", { credentials: "include" });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Failed to load profile");
        return;
      }

      const data = await res.json();
      setStudent(data);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Profile
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link
            href="/student"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/student" className="hover:text-gray-700">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-800">My Profile</span>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold">
              {student?.firstName?.[0]}
              {student?.lastName?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {student?.firstName} {student?.middleName} {student?.lastName}
            </h1>
            <p className="text-purple-100 mt-1">{student?.admissionNo}</p>
            {student?.classArm && (
              <p className="text-purple-100">
                {student.classArm.classLevel?.name} - {student.classArm.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Personal Information
          </h2>
          <div className="space-y-4">
            <InfoRow label="Full Name" value={`${student?.firstName} ${student?.middleName || ""} ${student?.lastName}`} />
            <InfoRow label="Admission Number" value={student?.admissionNo} />
            <InfoRow label="Date of Birth" value={formatDate(student?.dateOfBirth)} />
            <InfoRow label="Gender" value={student?.gender} capitalize />
            <InfoRow label="Religion" value={student?.religion} capitalize />
            <InfoRow label="Blood Group" value={student?.bloodGroup} />
            <InfoRow label="Genotype" value={student?.genotype} />
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Academic Information
          </h2>
          <div className="space-y-4">
            <InfoRow
              label="Current Class"
              value={
                student?.classArm
                  ? `${student.classArm.classLevel?.name || ""} ${student.classArm.name}`
                  : undefined
              }
            />
            <InfoRow
              label="Year of Admission"
              value={student?.yearOfAdmission ? new Date(student.yearOfAdmission).getFullYear().toString() : undefined}
            />
          </div>
        </div>

        {/* Origin Information */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Origin & Address
          </h2>
          <div className="space-y-4">
            <InfoRow label="Nationality" value={student?.nationality} capitalize />
            <InfoRow label="State of Origin" value={student?.stateOfOrigin} capitalize />
            <InfoRow label="Local Government" value={student?.localGovernment} capitalize />
            <InfoRow label="Address" value={student?.address} />
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            Parent/Guardian Information
          </h2>
          {student?.parents && student.parents.length > 0 ? (
            <div className="space-y-4">
              {student.parents.map((parent, index) => (
                <div
                  key={parent.id || index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">
                      {parent.firstName} {parent.lastName}
                    </p>
                    {parent.relationship && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full capitalize">
                        {parent.relationship}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    {parent.phone && (
                      <p className="text-gray-500">
                        <span className="font-medium">Phone:</span> {parent.phone}
                      </p>
                    )}
                    {parent.email && (
                      <p className="text-gray-500">
                        <span className="font-medium">Email:</span> {parent.email}
                      </p>
                    )}
                    {parent.occupation && (
                      <p className="text-gray-500">
                        <span className="font-medium">Occupation:</span>{" "}
                        {parent.occupation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No parent/guardian information available</p>
            </div>
          )}
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href="/student"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span>&#8592;</span> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

// Helper component for info rows
const InfoRow = ({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
}) => (
  <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className={`font-medium text-gray-800 ${capitalize ? "capitalize" : ""}`}>
      {value || "-"}
    </span>
  </div>
);

export default StudentProfilePage;
