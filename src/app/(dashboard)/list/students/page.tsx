"use client";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Student = {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  address: string;
  classArmId: number;
  yearOfAdmission: string;
};

const columns = [
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Admission No",
    accessor: "admissionNo",
  },
  {
    header: "Gender",
    accessor: "gender",
  },
  {
    header: "Class Arm",
    accessor: "classArmId",
  },
  {
    header: "Year of Admission",
    accessor: "yearOfAdmission",
  },
  {
    header: "Address",
    accessor: "address",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const StudentListPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "admissionNo" | "yearOfAdmission"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/student", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }
        const data = await response.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    // Ensure students is always an array
    const safeStudents = Array.isArray(students) ? students : [];
    let filtered = [...safeStudents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Gender filter
    if (filterGender) {
      filtered = filtered.filter((student) => student.gender === filterGender);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case "name":
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case "admissionNo":
          aValue = a.admissionNo.toLowerCase();
          bValue = b.admissionNo.toLowerCase();
          break;
        case "yearOfAdmission":
          aValue = new Date(a.yearOfAdmission).toISOString();
          bValue = new Date(b.yearOfAdmission).toISOString();
          break;
        default:
          aValue = a.firstName.toLowerCase();
          bValue = b.firstName.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, filterGender, sortBy, sortOrder]);

  const renderRow = (item: Student) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-600">
            {item.firstName.charAt(0)}
            {item.lastName.charAt(0)}
          </span>
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.firstName} {item.lastName}
          </h3>
          <p className="text-xs text-gray-500">{item.religion}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.admissionNo}</td>
      <td className="hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.gender === "Male"
              ? "bg-blue-100 text-blue-800"
              : "bg-pink-100 text-pink-800"
          }`}
        >
          {item.gender}
        </span>
      </td>
      <td className="hidden md:table-cell">Class {item.classArmId}</td>
      <td className="hidden md:table-cell">
        {new Date(item.yearOfAdmission).getFullYear()}
      </td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === "admin" && (
            <>
              <FormModal table="student" type="update" data={item} />
              <FormModal table="student" type="delete" id={parseInt(item.id)} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lamaPurple mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-lamaPurple text-white rounded-md hover:bg-lamaPurpleDark"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 sm:p-4 rounded-md flex-1 m-2 sm:m-4 mt-0">
      {/* TOP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            All Students
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {filteredStudents.length} of {students.length} students
          </p>
        </div>
        <div className="flex justify-end">
          {role === "admin" && <FormModal table="student" type="create" />}
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 pl-8 sm:pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Image
                src="/search.png"
                alt=""
                width={14}
                height={14}
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2"
              />
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Filter by Gender
            </label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Sort by
            </label>
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "name" | "admissionNo" | "yearOfAdmission"
                  )
                }
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="admissionNo">Admission No</option>
                <option value="yearOfAdmission">Year</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Sort ${
                  sortOrder === "asc" ? "Descending" : "Ascending"
                }`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          renderRow={renderRow}
          data={filteredStudents}
        />
      </div>
      {/* PAGINATION */}
      <div className="mt-4">
        <Pagination />
      </div>
    </div>
  );
};

export default StudentListPage;
