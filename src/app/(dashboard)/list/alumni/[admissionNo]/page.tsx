"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Alumni {
  id: string | number;
  admissionNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  stateOfOrigin?: string;
  localGovernment?: string;
  religion?: string;
  bloodGroup?: string;
  graduationYear?: string;
  graduationSession?: {
    id: string | number;
    name: string;
  };
  lastClass?: {
    name: string;
    classLevel?: {
      name: string;
    };
  };
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  createdAt?: string;
}

const AlumniDetailPage = () => {
  const params = useParams();
  const admissionNo = params.admissionNo as string;

  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/alumni/${admissionNo}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch alumni details");
        }

        const data = await response.json();
        setAlumni(data);
      } catch (err: any) {
        console.error("Error fetching alumni:", err);
        setError(err.message || "Failed to load alumni details");
      } finally {
        setLoading(false);
      }
    };

    if (admissionNo) {
      fetchAlumni();
    }
  }, [admissionNo]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-semibold">Error loading alumni</p>
          <p className="text-sm">{error || "Alumni not found"}</p>
          <Link
            href="/list/alumni"
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Back to Alumni List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/list/alumni" className="hover:text-gray-700">
          Alumni
        </Link>
        <span>/</span>
        <span className="text-gray-800">
          {alumni.firstName} {alumni.lastName}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl font-bold text-amber-600">
                  {alumni.firstName?.[0]}
                  {alumni.lastName?.[0]}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">
                {alumni.firstName} {alumni.middleName} {alumni.lastName}
              </h1>
              <p className="text-amber-100 mt-1">{alumni.admissionNo}</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                <span>Alumni</span>
                <span>Alumni</span>
              </div>
            </div>

            {/* Quick Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <p className="text-xs text-gray-500">Graduation</p>
                  <p className="font-medium text-gray-800">
                    {alumni.graduationSession?.name || alumni.graduationYear || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Class</p>
                  <p className="font-medium text-gray-800">
                    {alumni.lastClass?.classLevel?.name} {alumni.lastClass?.name || "-"}
                  </p>
                </div>
              </div>

              {alumni.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-800 break-all">
                      {alumni.email}
                    </p>
                  </div>
                </div>
              )}

              {alumni.phoneNumber && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">
                      {alumni.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:w-2/3 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                Info
              </span>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-800">
                  {alumni.firstName} {alumni.middleName} {alumni.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium text-gray-800">
                  {alumni.gender || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-800">
                  {formatDate(alumni.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Religion</p>
                <p className="font-medium text-gray-800">
                  {alumni.religion || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State of Origin</p>
                <p className="font-medium text-gray-800">
                  {alumni.stateOfOrigin || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Local Government</p>
                <p className="font-medium text-gray-800">
                  {alumni.localGovernment || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium text-gray-800">
                  {alumni.bloodGroup || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-800">
                  {alumni.address || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                Academic
              </span>
              Academic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Admission Number</p>
                <p className="font-medium text-gray-800">{alumni.admissionNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Graduation Session</p>
                <p className="font-medium text-gray-800">
                  {alumni.graduationSession?.name || alumni.graduationYear || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Class</p>
                <p className="font-medium text-gray-800">
                  {alumni.lastClass?.classLevel?.name} {alumni.lastClass?.name || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          {(alumni.parentName || alumni.parentPhone || alumni.parentEmail) && (
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  Family
                </span>
                Parent/Guardian Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alumni.parentName && (
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-800">{alumni.parentName}</p>
                  </div>
                )}
                {alumni.parentPhone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">{alumni.parentPhone}</p>
                  </div>
                )}
                {alumni.parentEmail && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{alumni.parentEmail}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-start">
            <Link
              href="/list/alumni"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <span>←</span> Back to Alumni List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDetailPage;
