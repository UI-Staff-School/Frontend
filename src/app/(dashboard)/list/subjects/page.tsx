"use client";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { role } from "@/lib/data";
import Image from "next/image";
import { useEffect, useState } from "react";

type Subject = {
  id: string;
  subjectName: string;
};

const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const SubjectListPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/subject", {
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch subjects");
        }
        const data = await response.json();
        const subjectsArray = Array.isArray(data) ? data : [];
        setSubjects(subjectsArray);
        setFilteredSubjects(subjectsArray);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    // Ensure subjects is always an array
    const safeSubjects = Array.isArray(subjects) ? subjects : [];
    let filtered = [...safeSubjects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((subject) =>
        subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a.subjectName.toLowerCase();
      const bValue = b.subjectName.toLowerCase();

      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredSubjects(filtered);
  }, [subjects, searchTerm, sortOrder]);

  const renderRow = (item: Subject) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 rounded-full bg-lamaPurple flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {item.subjectName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.subjectName}</h3>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal table="subject" type="update" data={item} />
              <FormModal table="subject" type="delete" id={item.id || (item as any).subjectId} />
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
            <p className="mt-4 text-gray-600">Loading subjects...</p>
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
            All Subjects
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {filteredSubjects.length} of {subjects.length} subjects
          </p>
        </div>
        <div className="flex justify-end">
          {role === "admin" && <FormModal table="subject" type="create" />}
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
                placeholder="Search by subject name..."
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

          {/* Sort */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Sort by
            </label>
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              <select
                value={sortBy}
                disabled
                className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
              >
                <option value="name">Name</option>
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
          data={filteredSubjects}
        />
      </div>
      {/* PAGINATION */}
      <div className="mt-4">
        <Pagination />
      </div>
    </div>
  );
};

export default SubjectListPage;
