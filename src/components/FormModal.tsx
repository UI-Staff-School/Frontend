"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

// USE LAZY LOADING

// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (type: "create" | "update", data?: any) => JSX.Element;
} = {
  teacher: (type, data) => <TeacherForm type={type} data={data} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
};

const FormModal = ({
  table,
  type,
  data,
  id,
}: {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    return type === "delete" && id ? (
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-white">🗑️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Delete Staff Member
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Are you sure you want to delete this staff member? This action cannot
          be undone and all associated data will be permanently removed.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setOpen(false)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch(`/api/staff/${id}`, {
                  method: "DELETE",
                });
                if (response.ok) {
                  window.location.reload();
                } else {
                  console.error("Failed to delete staff member");
                }
              } catch (error) {
                console.error("Error deleting staff member:", error);
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Delete Staff Member
          </button>
        </div>
      </div>
    ) : type === "create" || type === "update" ? (
      forms[table](type, data)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div
            className={`bg-white rounded-xl relative shadow-2xl ${
              type === "delete"
                ? "w-full max-w-md"
                : "w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            }`}
          >
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={16} height={16} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
