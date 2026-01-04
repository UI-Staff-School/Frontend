"use client";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type ClassLevel = {
  id: string;
  className: string;
  coordinatorId: string;
  subjectIds: number[];
};

type ClassArm = {
  id: string;
  armName: string;
  classLevelId: number;
  teacherId: string;
  classLevel?: {
    id: number;
    name?: string;
    className?: string;
  };
  teacher?: {
    id: string;
    firstName?: string;
    lastName?: string;
    staffId?: string;
  };
};

type Staff = {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  role: string;
};

const classLevelColumns = [
  {
    header: "Class Name",
    accessor: "className",
  },
  {
    header: "Coordinator",
    accessor: "coordinatorId",
    className: "hidden md:table-cell",
  },
  {
    header: "Subjects",
    accessor: "subjectIds",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const classArmColumns = [
  {
    header: "Arm Name",
    accessor: "armName",
  },
  {
    header: "Class Level",
    accessor: "classLevelId",
    className: "hidden md:table-cell",
  },
  {
    header: "Teacher",
    accessor: "teacherId",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ClassListPage = () => {
  const [activeTab, setActiveTab] = useState<"levels" | "arms">("levels");
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<ClassLevel[]>([]);
  const [filteredArms, setFilteredArms] = useState<ClassArm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "coordinator">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [levelsResponse, armsResponse, staffResponse] = await Promise.all([
          fetch("/api/class/level", { credentials: "include" }),
          fetch("/api/class/arms", { credentials: "include" }),
          fetch("/api/staff", { credentials: "include" }),
        ]);

        if (!levelsResponse.ok) {
          const errorData = await levelsResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch class levels");
        }
        if (!armsResponse.ok) {
          const errorData = await armsResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch class arms");
        }

        let levelsData = await levelsResponse.json();
        const armsData = await armsResponse.json();

        // Handle staff response (don't fail if it errors)
        let staffData: Staff[] = [];
        if (staffResponse.ok) {
          const staffPayload = await staffResponse.json();
          staffData = Array.isArray(staffPayload) ? staffPayload : [];
        }

        // Normalize class levels to ensure consistent ID field
        if (Array.isArray(levelsData)) {
          const { normalizeClassLevels } = await import("@/lib/class-level-utils");
          levelsData = normalizeClassLevels(levelsData);
        }

        setClassLevels(Array.isArray(levelsData) ? levelsData : []);
        setClassArms(Array.isArray(armsData) ? armsData : []);
        setStaff(staffData);
        setFilteredLevels(Array.isArray(levelsData) ? levelsData : []);
        setFilteredArms(Array.isArray(armsData) ? armsData : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    if (activeTab === "levels") {
      // Ensure classLevels is always an array
      const safeLevels = Array.isArray(classLevels) ? classLevels : [];
      let filtered = [...safeLevels];

      if (searchTerm) {
        filtered = filtered.filter((level) => {
          // Get coordinator name for searching
          const coordinator = staff.find(
            (s) => String(s.id) === String(level.coordinatorId) || String(s.staffId) === String(level.coordinatorId)
          );
          const coordinatorName = coordinator
            ? `${coordinator.firstName || ""} ${coordinator.lastName || ""}`.trim()
            : "";

          return (
            level.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
            level.coordinatorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coordinatorName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }

      filtered.sort((a, b) => {
        let aValue: string;
        let bValue: string;

        switch (sortBy) {
          case "name":
            aValue = a.className.toLowerCase();
            bValue = b.className.toLowerCase();
            break;
          case "coordinator":
            aValue = a.coordinatorId.toLowerCase();
            bValue = b.coordinatorId.toLowerCase();
            break;
          default:
            aValue = a.className.toLowerCase();
            bValue = b.className.toLowerCase();
        }

        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });

      setFilteredLevels(filtered);
    } else {
      // Ensure classArms is always an array
      const safeArms = Array.isArray(classArms) ? classArms : [];
      let filtered = [...safeArms];

      if (searchTerm) {
        filtered = filtered.filter((arm) => {
          // Get class level name for searching
          const classLevelName =
            arm.classLevel?.className ||
            arm.classLevel?.name ||
            classLevels.find((l) => String(l.id) === String(arm.classLevelId))
              ?.className ||
            "";

          // Get teacher name for searching
          let teacherName = "";
          if (arm.teacher) {
            teacherName = `${arm.teacher.firstName || ""} ${arm.teacher.lastName || ""}`.trim();
          } else {
            const teacher = staff.find(
              (s) => String(s.id) === String(arm.teacherId) || String(s.staffId) === String(arm.teacherId)
            );
            if (teacher) {
              teacherName = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();
            }
          }

          return (
            arm.armName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            arm.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classLevelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacherName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }

      filtered.sort((a, b) => {
        const aValue = a.armName.toLowerCase();
        const bValue = b.armName.toLowerCase();

        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });

      setFilteredArms(filtered);
    }
  }, [classLevels, classArms, staff, searchTerm, sortBy, sortOrder, activeTab]);

  // Helper function to get coordinator name
  const getCoordinatorName = (coordinatorId: string): string => {
    const coordinator = staff.find(
      (s) => String(s.id) === String(coordinatorId) || String(s.staffId) === String(coordinatorId)
    );
    if (coordinator) {
      return `${coordinator.firstName || ""} ${coordinator.lastName || ""}`.trim() || coordinatorId;
    }
    return coordinatorId;
  };

  const renderLevelRow = (item: ClassLevel) => {
    const coordinatorName = getCoordinatorName(item.coordinatorId);

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-full bg-lamaSky flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {item.className.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.className}</h3>
          </div>
        </td>
        <td className="hidden md:table-cell">
          <div className="flex flex-col">
            <span className="font-medium">{coordinatorName}</span>
            {coordinatorName !== item.coordinatorId && (
              <span className="text-xs text-gray-400">{item.coordinatorId}</span>
            )}
          </div>
        </td>
        <td className="hidden lg:table-cell">
          {item.subjectIds?.length || 0} subjects
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal table="classLevel" type="update" data={item} />
                <FormModal table="classLevel" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  // Helper function to get class level name
  const getClassLevelName = (arm: ClassArm): string => {
    // First try to get from nested classLevel object
    if (arm.classLevel) {
      return arm.classLevel.className || arm.classLevel.name || `Class ${arm.classLevelId}`;
    }
    // Fall back to looking up in classLevels array
    const classLevel = classLevels.find(
      (level) => String(level.id) === String(arm.classLevelId)
    );
    return classLevel?.className || `Class ${arm.classLevelId}`;
  };

  // Helper function to get teacher name
  const getTeacherName = (arm: ClassArm): string => {
    // First try to get from nested teacher object
    if (arm.teacher) {
      const name = `${arm.teacher.firstName || ""} ${arm.teacher.lastName || ""}`.trim();
      return name || arm.teacherId;
    }
    // Fall back to looking up in staff array
    const teacher = staff.find(
      (s) => String(s.id) === String(arm.teacherId) || String(s.staffId) === String(arm.teacherId)
    );
    if (teacher) {
      return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || arm.teacherId;
    }
    return arm.teacherId;
  };

  const renderArmRow = (item: ClassArm) => {
    const classLevelName = getClassLevelName(item);
    const teacherName = getTeacherName(item);

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-full bg-lamaYellow flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {item.armName.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{classLevelName} {item.armName}</h3>
            <span className="text-xs text-gray-500">{classLevelName}</span>
          </div>
        </td>
        <td className="hidden md:table-cell">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {classLevelName}
          </span>
        </td>
        <td className="hidden md:table-cell">
          <div className="flex flex-col">
            <span className="font-medium">{teacherName}</span>
            {teacherName !== item.teacherId && (
              <span className="text-xs text-gray-400">{item.teacherId}</span>
            )}
          </div>
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal table="classArm" type="update" data={item} />
                <FormModal table="classArm" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lamaPurple mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading classes...</p>
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
            All Classes
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {activeTab === "levels"
              ? `${filteredLevels.length} of ${classLevels.length} class levels`
              : `${filteredArms.length} of ${classArms.length} class arms`}
          </p>
        </div>
        <div className="flex justify-end">
          {role === "admin" && (
            <FormModal
              table={activeTab === "levels" ? "classLevel" : "classArm"}
              type="create"
            />
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("levels")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "levels"
                ? "border-lamaPurple text-lamaPurple"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Class Levels ({classLevels.length})
          </button>
          <button
            onClick={() => setActiveTab("arms")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "arms"
                ? "border-lamaPurple text-lamaPurple"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Class Arms ({classArms.length})
          </button>
        </nav>
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
                placeholder={
                  activeTab === "levels"
                    ? "Search by class name or coordinator name..."
                    : "Search by arm name, class level, or teacher name..."
                }
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
          {activeTab === "levels" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Sort by
              </label>
              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "coordinator")
                  }
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="coordinator">Coordinator</option>
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
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="overflow-x-auto">
        <Table
          columns={activeTab === "levels" ? classLevelColumns : classArmColumns}
          renderRow={activeTab === "levels" ? renderLevelRow : renderArmRow}
          data={activeTab === "levels" ? filteredLevels : filteredArms}
        />
      </div>
      {/* PAGINATION */}
      <div className="mt-4">
        <Pagination />
      </div>
    </div>
  );
};

export default ClassListPage;
