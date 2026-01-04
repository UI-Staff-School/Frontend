"use client";

import Image from "next/image";
import { useState, useCallback, ReactElement } from "react";
import TeacherForm from "./forms/TeacherForm";
import StudentForm from "./forms/StudentForm";
import SubjectForm from "./forms/SubjectForm";
import ClassLevelForm from "./forms/ClassLevelForm";
import ClassArmForm from "./forms/ClassArmForm";

// ============================================================================
// Types
// ============================================================================

export type TableKey =
  | "teacher"
  | "student"
  | "subject"
  | "classLevel"
  | "classArm"
  | "result"
  | "parent"
  | "announcement"
  | "assignment"
  | "event"
  | "exam"
  | "fee"
  | "lesson"
  | "session";

<<<<<<< HEAD
export type FormType = "create" | "update" | "delete";

type FormComponent = (
  type: "create" | "update",
  data?: unknown
) => ReactElement;

type DeleteConfig = {
  endpoint: (id: string | number) => string;
  title: string;
  message: string;
=======
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
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SessionForm = dynamic(() => import("./forms/SessionForm"), {
  loading: () => <h1>Loading...</h1>,
});
const FeeForm = dynamic(() => import("./forms/FeeForm"), {
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
  parent: (type, data) => <ParentForm type={type} data={data} />,
  session: (type, data) => <SessionForm type={type} data={data} />,
  fee: (type, data) => <FeeForm type={type} data={data} />,
>>>>>>> habyaad_dev
};

type TableConfig = {
  delete: DeleteConfig;
  form?: FormComponent;
};

type ModalConfig = Record<TableKey, TableConfig>;

// ============================================================================
// Configuration
// ============================================================================

const modalConfig: ModalConfig = {
  teacher: {
    delete: {
      endpoint: (id) => `/api/staff/${id}`,
      title: "Delete Staff Member",
      message:
        "Are you sure you want to delete this staff member? This action cannot be undone and all associated data will be permanently removed.",
    },
    form: (type, data) => <TeacherForm type={type} data={data} />,
  },
  student: {
    delete: {
      endpoint: (id) => `/api/student/${id}`,
      title: "Delete Student",
      message:
        "Are you sure you want to delete this student? This action cannot be undone and all associated data will be permanently removed.",
    },
    form: (type, data) => <StudentForm type={type} data={data} />,
  },
  subject: {
    delete: {
      endpoint: (id) => `/api/subject/${id}`,
      title: "Delete Subject",
      message:
        "Are you sure you want to delete this subject? This action cannot be undone and all associated data will be permanently removed.",
    },
    form: (type, data) => <SubjectForm type={type} data={data} />,
  },
  classLevel: {
    delete: {
      endpoint: (id) => `/api/class/level/${id}`,
      title: "Delete Class Level",
      message:
        "Are you sure you want to delete this class level? This action cannot be undone and all associated data will be permanently removed.",
    },
    form: (type, data) => <ClassLevelForm type={type} data={data} />,
  },
  classArm: {
    delete: {
      endpoint: (id) => `/api/class/arms/${id}`,
      title: "Delete Class Arm",
      message:
        "Are you sure you want to delete this class arm? This action cannot be undone and all associated data will be permanently removed.",
    },
    form: (type, data) => <ClassArmForm type={type} data={data} />,
  },
  result: {
    delete: {
      endpoint: (id) => `/api/results/${id}`,
      title: "Delete Result",
      message:
        "Are you sure you want to delete this result? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
  parent: {
    delete: {
      endpoint: (id) => `/api/parent/${id}`,
      title: "Delete Parent",
      message:
        "Are you sure you want to delete this parent? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
  announcement: {
    delete: {
      endpoint: (id) => `/api/announcement/${id}`,
      title: "Delete Announcement",
      message:
        "Are you sure you want to delete this announcement? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
  assignment: {
    delete: {
      endpoint: (id) => `/api/assignment/${id}`,
      title: "Delete Assignment",
      message:
        "Are you sure you want to delete this assignment? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
  event: {
    delete: {
      endpoint: (id) => `/api/event/${id}`,
      title: "Delete Event",
      message:
        "Are you sure you want to delete this event? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
  exam: {
    delete: {
      endpoint: (id) => `/api/exam/${id}`,
      title: "Delete Exam",
      message:
        "Are you sure you want to delete this exam? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
  fee: {
    delete: {
      endpoint: (id) => `/api/fee/${id}`,
      title: "Delete Fee",
      message:
        "Are you sure you want to delete this fee? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
  lesson: {
    delete: {
      endpoint: (id) => `/api/lesson/${id}`,
      title: "Delete Lesson",
      message:
        "Are you sure you want to delete this lesson? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
  session: {
    delete: {
      endpoint: (id) => `/api/session/${id}`,
      title: "Delete Session",
      message:
        "Are you sure you want to delete this session? This action cannot be undone and all associated data will be permanently removed.",
    },
  },
};

// ============================================================================
// Component Props
// ============================================================================

type FormModalProps = {
  table: TableKey;
  type: FormType;
  data?: unknown;
  id?: string | number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

// ============================================================================
// Component
// ============================================================================

const FormModal = ({
  table,
  type,
  data,
  id,
<<<<<<< HEAD
  onSuccess,
  onError,
}: FormModalProps) => {
=======
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
    | "announcement"
    | "session"
    | "fee";
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

>>>>>>> habyaad_dev
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

<<<<<<< HEAD
  const config = modalConfig[table];
=======
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
      parent: {
        endpoint: `/api/parent/${id}`,
        title: "Delete Parent",
        message:
          "Are you sure you want to delete this parent? This action cannot be undone and all linked student relationships will be removed.",
      },
      session: {
        endpoint: `/api/session/${id}`,
        title: "Delete Session",
        message:
          "Are you sure you want to delete this session? This action cannot be undone and all associated terms and data will be permanently removed.",
      },
      fee: {
        endpoint: `/api/payment/fee/${id}`,
        title: "Delete Fee",
        message:
          "Are you sure you want to delete this fee? This action cannot be undone.",
      },
    };
>>>>>>> habyaad_dev

  // Validate props based on type
  if (type === "delete" && !id) {
    console.error(
      `FormModal: Delete operation requires an 'id' prop for table '${table}'`
    );
  }

  if ((type === "create" || type === "update") && !config.form) {
    console.error(
      `FormModal: No form component configured for table '${table}'`
    );
  }

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleDelete = useCallback(async () => {
    if (!id) {
      const error = new Error("Delete operation requires a valid ID");
      setDeleteError(error.message);
      onError?.(error);
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { endpoint } = config.delete;
      const response = await fetch(endpoint(id), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `Failed to delete ${table}. Please try again.`;
        throw new Error(errorMessage);
      }

      // Success
      setOpen(false);
      onSuccess?.();

      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to delete ${table}. Please try again.`;
      setDeleteError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsDeleting(false);
    }
  }, [id, config, table, onSuccess, onError]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setDeleteError(null);
    setIsDeleting(false);
  }, []);

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const getButtonStyles = () => {
    const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
    const isDisabled = type === "delete" && !id;
    const bgColor = isDisabled
      ? "bg-gray-300 cursor-not-allowed"
      : type === "create"
      ? "bg-lamaYellow hover:bg-lamaYellow/90"
      : type === "update"
      ? "bg-lamaSky hover:bg-lamaSky/90"
      : "bg-lamaPurple hover:bg-lamaPurple/90";

    return `${size} flex items-center justify-center rounded-full ${bgColor} transition-colors`;
  };

  const renderDeleteConfirmation = () => {
    if (!id) {
      return (
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Delete Request
          </h2>
          <p className="text-red-600 mb-8">
            Delete operation requires a valid ID.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      );
    }

    const { title, message } = config.delete;

    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl text-white">X</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">{message}</p>

        {deleteError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{deleteError}</p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin">⏳</span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    if (!config.form) {
      return (
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Form Not Available
          </h2>
          <p className="text-red-600 mb-8">
            No form component configured for table: <strong>{table}</strong>
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      );
    }

    return config.form(type as "create" | "update", data);
  };

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const handleOpen = useCallback(() => {
    // Validate that delete operations have an ID before opening
    if (type === "delete" && !id) {
      const error = new Error(
        `Delete operation requires an ID for table '${table}'. Please check the data structure.`
      );
      console.error(error.message);
      onError?.(error);
      // Optionally show an alert to the user
      alert(
        `Cannot delete: Missing ID for ${table}. Please refresh the page and try again.`
      );
      return;
    }
    setOpen(true);
  }, [type, id, table, onError]);

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <>
      <button
        className={getButtonStyles()}
        onClick={handleOpen}
        aria-label={`${type} ${table}`}
        type="button"
        disabled={type === "delete" && !id}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            className={`bg-white rounded-xl shadow-2xl relative ${
              type === "delete"
                ? "w-full max-w-md"
                : "w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {type === "delete" ? renderDeleteConfirmation() : renderForm()}

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Close modal"
              type="button"
              disabled={isDeleting}
            >
              <Image src="/close.png" alt="" width={16} height={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
