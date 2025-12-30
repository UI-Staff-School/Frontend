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
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassLevelForm = dynamic(() => import("./forms/ClassLevelForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassArmForm = dynamic(() => import("./forms/ClassArmForm"), {
  loading: () => <h1>Loading...</h1>,
});

const forms: {
  [key: string]: (type: "create" | "update", data?: any) => JSX.Element;
} = {
  teacher: (type, data) => <TeacherForm type={type} data={data} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
  subject: (type, data) => <SubjectForm type={type} data={data} />,
  classLevel: (type, data) => <ClassLevelForm type={type} data={data} />,
  classArm: (type, data) => <ClassArmForm type={type} data={data} />,
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
    | "classLevel"
    | "classArm"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const getDeleteConfig = () => {
    const configs: {
      [key: string]: { endpoint: string; title: string; message: string };
    } = {
      teacher: {
        endpoint: `/api/staff/${id}`,
        title: "Delete Staff Member",
        message:
          "Are you sure you want to delete this staff member? This action cannot be undone and all associated data will be permanently removed.",
      },
      student: {
        endpoint: `/api/student/${id}`,
        title: "Delete Student",
        message:
          "Are you sure you want to delete this student? This action cannot be undone and all associated data will be permanently removed.",
      },
      subject: {
        endpoint: `/api/subject/${id}`,
        title: "Delete Subject",
        message:
          "Are you sure you want to delete this subject? This action cannot be undone and all associated data will be permanently removed.",
      },
      classLevel: {
        endpoint: `/api/class/level/${id}`,
        title: "Delete Class Level",
        message:
          "Are you sure you want to delete this class level? This action cannot be undone and all associated data will be permanently removed.",
      },
      classArm: {
        endpoint: `/api/class/arms/${id}`,
        title: "Delete Class Arm",
        message:
          "Are you sure you want to delete this class arm? This action cannot be undone and all associated data will be permanently removed.",
      },
    };

    return configs[table] || {
      endpoint: `/api/${table}/${id}`,
      title: "Delete Item",
      message:
        "Are you sure you want to delete this item? This action cannot be undone.",
    };
  };

  const Form = () => {
    return type === "delete" && id ? (
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-white">🗑️</span>
        </div>
        {(() => {
          const config = getDeleteConfig();
          return (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {config.title}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {config.message}
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
                      const config = getDeleteConfig();
                      const response = await fetch(config.endpoint, {
                        method: "DELETE",
                        credentials: "include",
                      });
                      if (response.ok) {
                        window.location.reload();
                      } else {
                        const errorData = await response.json();
                        alert(errorData.error || "Failed to delete item");
                      }
                    } catch (error: any) {
                      console.error("Error deleting item:", error);
                      alert("Failed to delete item. Please try again.");
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {getDeleteConfig().title}
                </button>
              </div>
            </>
          );
        })()}
      </div>
    ) : type === "create" || type === "update" ? (
      forms[table] ? (
        forms[table](type, data)
      ) : (
        <div className="p-8 text-center">
          <p className="text-red-600">Form not found for table: {table}</p>
        </div>
      )
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
