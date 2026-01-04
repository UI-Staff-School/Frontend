"use client";

import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LinkedStudent {
  admissionNo: string;
  firstName: string;
  lastName: string;
}

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  occupation?: string;
  relationship?: string;
  students?: LinkedStudent[];
}

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Children",
    accessor: "students",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ParentListPage = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchParents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/parent", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch parents");
        }

        const data = await response.json();
        let parentsArray = Array.isArray(data) ? data : data.data || [];

        // Normalize parent data - ensure each parent has an id
        parentsArray = parentsArray.map((parent: any, index: number) => {
          const id = String(parent.id || parent._id || parent.parentId || `parent-${index}`);
          console.log(`[Parents] Parent ${index}:`, {
            originalId: parent.id,
            _id: parent._id,
            parentId: parent.parentId,
            normalizedId: id,
            name: `${parent.firstName} ${parent.lastName}`
          });
          return {
            ...parent,
            id,
          };
        });

        setParents(parentsArray);
      } catch (err: any) {
        console.error("Error fetching parents:", err);
        setError(err.message || "Failed to load parents");
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
  }, []);

  // Filter parents based on search term
  const filteredParents = parents.filter((parent) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${parent.firstName} ${parent.lastName}`.toLowerCase();
    const email = (parent.email || "").toLowerCase();
    const phone = (parent.phoneNumber || "").toLowerCase();

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchLower)
    );
  });

  const renderRow = (item: Parent) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {item.firstName?.[0]}{item.lastName?.[0]}
          </span>
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.firstName} {item.lastName}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
          {item.relationship && (
            <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full w-fit mt-1">
              {item.relationship}
            </span>
          )}
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.students && item.students.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.students.map((student) => (
              <span
                key={student.admissionNo}
                className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
              >
                {student.firstName} {student.lastName}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-xs italic">No children linked</span>
        )}
      </td>
      <td className="hidden lg:table-cell">{item.phoneNumber}</td>
      <td className="hidden lg:table-cell">
        <span className="text-sm text-gray-600 line-clamp-1">{item.address}</span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/parents/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky hover:bg-lamaSkyLight active:scale-95 transition-transform">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <FormModal table="parent" type="update" data={item} />
          <FormModal table="parent" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <p className="text-lg font-semibold">Error loading parents</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="Search parents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormModal table="parent" type="create" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 my-4">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 rounded-lg">
          <span className="text-teal-700 font-semibold">{parents.length}</span>
          <span className="text-gray-600 ml-2">Total Parents</span>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-lg">
          <span className="text-purple-700 font-semibold">
            {parents.reduce((acc, p) => acc + (p.students?.length || 0), 0)}
          </span>
          <span className="text-gray-600 ml-2">Linked Children</span>
        </div>
      </div>

      {/* LIST */}
      {filteredParents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <p className="text-lg">No parents found</p>
          <p className="text-sm">
            {searchTerm
              ? "Try adjusting your search"
              : "Add a parent to get started"}
          </p>
        </div>
      ) : (
        <Table columns={columns} renderRow={renderRow} data={filteredParents} />
      )}

      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ParentListPage;
