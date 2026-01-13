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
  subjectIds?: number[];
  subjectsOfferred?: Array<{ subjectId: number; subjectName: string }>;
};

type ClassArm = {
  id?: string;
  classArmId?: string | number;
  armId?: string | number;
  armName: string;
  classLevelId: number;
  teacherId: string;
  teacher?: {
    firstName: string;
    lastName: string;
  };
  classLevel?: {
    id: number;
    className?: string;
    name?: string;
  };
};

type Staff = {
  id: string | number;
  staffId?: string;
  firstName: string;
  lastName: string;
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
    header: "Subjects Count",
    accessor: "subjectIds",
    className: "hidden md:table-cell",
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
        const [levelsResponse, armsResponse, staffResponse] = await Promise.all(
          [
            fetch("/api/class/level", { credentials: "include" }),
            fetch("/api/class/arms", { credentials: "include" }),
            fetch("/api/staff", { credentials: "include" }),
          ]
        );

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
          const { normalizeClassLevels } = await import(
            "@/lib/class-level-utils"
          );
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
            (s) =>
              String(s.id) === String(level.coordinatorId) ||
              String(s.staffId) === String(level.coordinatorId)
          );
          const coordinatorName = coordinator
            ? `${coordinator.firstName || ""} ${
                coordinator.lastName || ""
              }`.trim()
            : "";

          return (
            level.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
            level.coordinatorId
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
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
            teacherName = `${arm.teacher.firstName || ""} ${
              arm.teacher.lastName || ""
            }`.trim();
          } else {
            const teacher = staff.find(
              (s) =>
                String(s.id) === String(arm.teacherId) ||
                String(s.staffId) === String(arm.teacherId)
            );
            if (teacher) {
              teacherName = `${teacher.firstName || ""} ${
                teacher.lastName || ""
              }`.trim();
            }
          }

          const teacherIdStr = String(arm.teacherId || "");

          return (
            arm.armName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacherIdStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const renderLevelRow = (item: ClassLevel) => {
    const coordinator = staff.find(
      (s) =>
        String(s.id) === String(item.coordinatorId) ||
        String(s.staffId) === String(item.coordinatorId)
    );
    const coordinatorName = coordinator
      ? `${coordinator.firstName || ""} ${coordinator.lastName || ""}`.trim()
      : item.coordinatorId || "N/A";

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
            <p className="text-xs text-gray-500">{coordinatorName}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{coordinatorName}</td>
        <td className="hidden md:table-cell">
          {item.subjectsOfferred?.length || item.subjectIds?.length || 0}
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

  const renderArmRow = (item: ClassArm) => {
    const classLevelName =
      item.classLevel?.className ||
      item.classLevel?.name ||
      classLevels.find((l) => String(l.id) === String(item.classLevelId))
        ?.className ||
      "";

    let teacherName = "";
    if (item.teacher) {
      teacherName = `${item.teacher.firstName || ""} ${
        item.teacher.lastName || ""
      }`.trim();
    } else {
      const teacher = staff.find(
        (s) =>
          String(s.id) === String(item.teacherId) ||
          String(s.staffId) === String(item.teacherId)
      );
      if (teacher) {
        teacherName = `${teacher.firstName || ""} ${
          teacher.lastName || ""
        }`.trim();
      }
    }

    return (
      <tr
        key={item.id || item.classArmId}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-full bg-lamaYellow flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {item.armName.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.armName}</h3>
            <p className="text-xs text-gray-500">{classLevelName}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">
          {classLevelName || item.classLevelId}
        </td>
        <td className="hidden md:table-cell">
          {teacherName || item.teacherId || "N/A"}
        </td>
        <td>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormModal table="classArm" type="update" data={item} />
                <FormModal
                  table="classArm"
                  type="delete"
                  id={item.id || item.classArmId}
                />
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
            {activeTab === "levels" && (
              <span className="ml-2 text-indigo-600 font-medium">
                •{" "}
                {classLevels.reduce(
                  (sum, level) =>
                    sum +
                    (level.subjectsOfferred?.length ||
                      level.subjectIds?.length ||
                      0),
                  0
                )}{" "}
                total subjects assigned
              </span>
            )}
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

      {/* STATS SUMMARY - Only show for class levels */}
      {activeTab === "levels" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">
                  Total Classes
                </p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">
                  {classLevels.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center"></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Total Subjects Assigned
                </p>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {classLevels.reduce(
                    (sum, level) =>
                      sum +
                      (level.subjectsOfferred?.length ||
                        level.subjectIds?.length ||
                        0),
                    0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center"></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Average Subjects/Class
                </p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {classLevels.length > 0
                    ? Math.round(
                        (classLevels.reduce(
                          (sum, level) =>
                            sum +
                            (level.subjectsOfferred?.length ||
                              level.subjectIds?.length ||
                              0),
                          0
                        ) /
                          classLevels.length) *
                          10
                      ) / 10
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center"></div>
            </div>
          </div>
        </div>
      )}

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
