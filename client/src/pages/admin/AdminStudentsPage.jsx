import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useDeleteUser, useSuspendUser, useUnsuspendUser, useUsers } from "../../hooks/admin";
import ResponsiveDataSection from "../../components/admin/ResponsiveDataSection";

const PAGE_SIZE = 10;

function getUserName(user) {
  if (!user) return "—";
  if (user.fullName) return user.fullName;
  const nameParts = [user.firstName, user.lastName].filter(Boolean);
  if (nameParts.length) return nameParts.join(" ");
  return user.name || "—";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString();
}

const studentColumns = [
    {
      header: "Actions",
      cell: (student, { onEdit, onDelete, onSuspend, onUnsuspend }) => {
        const isSuspended = student?.accountStatus === "suspended";
        return (
          <div className="flex flex-wrap gap-2">
            <button
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200"
              onClick={() => onEdit(student)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
              onClick={() => onDelete(student)}
            >
              Delete
            </button>
            {isSuspended ? (
              <button
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                onClick={() => onUnsuspend(student)}
              >
                Unsuspend
              </button>
            ) : (
              <button
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200"
                onClick={() => onSuspend(student)}
              >
                Suspend
              </button>
            )}
          </div>
        );
      },
    },
  {
    header: "Name",
    cell: (student) => (
      <div className="flex items-center gap-3 min-w-[150px]">
        <img
          src={student?.profileImageUrl || "https://via.placeholder.com/48x48?text=S"}
          alt={getUserName(student)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
        />
        <span className="text-sm text-gray-700 break-words">
          {getUserName(student)}
        </span>
      </div>
    ),
  },
  { header: "Email", cell: (student) => student?.email ?? "—" },
  { header: "Date Joined", cell: (student) => formatDate(student?.createdAt) },
  {
    header: "Status",
    cell: (student) => {
      const status = student?.accountStatus || student?.status || "—";
      return (
        <span
          className={`inline-block px-3 py-1 text-xs rounded-full ${
            status === "active"
              ? "bg-blue-100 text-blue-600"
              : status === "inactive"
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </span>
      );
    },
  },
];

const renderStudentCard = (student, { onEdit, onDelete, onSuspend, onUnsuspend }) => {
  const status = student?.accountStatus || student?.status || "—";
  const isSuspended = status === "suspended";
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <img
        src={student?.profileImageUrl || "https://via.placeholder.com/48x48?text=S"}
        alt={getUserName(student)}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />
      <p className="font-medium text-gray-900">{getUserName(student)}</p>
      <p className="text-sm text-gray-500 mt-1">{student?.email ?? "—"}</p>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <span
          className={`inline-block px-3 py-1 text-xs rounded-full ${
            status === "active"
              ? "bg-blue-100 text-blue-600"
              : status === "inactive"
              ? "bg-gray-100 text-gray-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {status}
        </span>
        <div className="flex flex-wrap gap-2 justify-end">
          <Link
            className="px-4 py-2 bg-white border rounded-full shadow-sm text-blue-600 text-sm"
            to={`/admin/students/${student?.id}`}
          >
            View
          </Link>
          <button
            type="button"
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200"
            onClick={() => onEdit(student)}
          >
            Edit
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
            onClick={() => onDelete(student)}
          >
            Delete
          </button>
          {isSuspended ? (
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
              onClick={() => onUnsuspend(student)}
            >
              Unsuspend
            </button>
          ) : (
            <button
              type="button"
              className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700"
              onClick={() => onSuspend(student)}
            >
              Suspend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", gradeLevel: "" });
  const { data, isLoading, isFetching, error, refetch } = useUsers({
    role: "student",
    page,
    limit: PAGE_SIZE,
  });

  const students = data?.users ?? [];
  const meta = data?.meta;

  const totalStudents = meta?.total ?? students.length ?? 0;
  const pageSize = meta?.limit ?? PAGE_SIZE;
  const computedTotalPages = pageSize
    ? Math.ceil(totalStudents / pageSize)
    : Math.ceil(totalStudents / PAGE_SIZE);
  const totalPages = Math.max(1, computedTotalPages || 1);
  const currentPage = meta?.page ?? page;
  const currentCount = meta?.count ?? students.length ?? 0;
  const hasResults = totalStudents > 0 && currentCount > 0;
  const effectivePageSize = pageSize || PAGE_SIZE;

  // Handlers
  const deleteUserMutation = useDeleteUser();
  const suspendUserMutation = useSuspendUser();
  const unsuspendUserMutation = useUnsuspendUser();

  const handleAdd = () => {
    setEditStudent(null);
    setForm({ firstName: "", lastName: "", email: "", password: "", gradeLevel: "" });
    setShowModal(true);
  };
  const handleEdit = (student) => {
    setEditStudent(student);
    setForm({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      password: "",
      gradeLevel: student.student?.gradeLevel || "",
    });
    setShowModal(true);
  };
  const handleDelete = (student) => {
    if (!window.confirm(`Delete ${getUserName(student)}? This action cannot be undone.`)) {
      return;
    }
    deleteUserMutation.mutate(student.id);
  };
  const handleSuspend = (student) => {
    const duration = window.prompt(
      "Enter suspension duration in days (leave blank for default reason):"
    );
    if (duration === null) return;
    const parsed = parseInt(duration, 10);
    const reason = parsed > 0
      ? `Suspended for ${parsed} day${parsed === 1 ? "" : "s"}.`
      : "Suspended by admin.";
    suspendUserMutation.mutate({ userId: student.id, reason });
  };
  const handleUnsuspend = (student) => {
    if (!window.confirm(`Unsuspend ${getUserName(student)}?`)) {
      return;
    }
    unsuspendUserMutation.mutate(student.id);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editStudent) {
      await axios.put(`/admin/users/${editStudent.id}`, {
        ...form,
        student: { gradeLevel: form.gradeLevel },
      });
    } else {
      await axios.post(`/admin/users`, {
        ...form,
        role: "student",
        student: { gradeLevel: form.gradeLevel },
      });
    }
    setShowModal(false);
    refetch();
  };
  const rangeStart = hasResults ? (currentPage - 1) * effectivePageSize + 1 : 0;
  const rangeEnd = hasResults
    ? (currentPage - 1) * effectivePageSize + currentCount
    : 0;

  useEffect(() => {
    if (meta?.page && meta.page !== page) {
      setPage(meta.page);
    }
  }, [meta?.page, page]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border shadow-sm p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage registered students and review their onboarding details.
          </p>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
          onClick={handleAdd}
        >
          Add Student
        </button>
      </div>

      <ResponsiveDataSection
        title="All Students"
        data={students}
        columns={studentColumns}
        renderCard={renderStudentCard}
        getLink={(student) => `/admin/students/${student.id}`}
        isLoading={isLoading}
        error={error}
        emptyMessage="No students found."
        columnProps={{
          onEdit: handleEdit,
          onDelete: handleDelete,
          onSuspend: handleSuspend,
          onUnsuspend: handleUnsuspend,
        }}
      />

      {isFetching && !isLoading ? (
        <div className="mt-4">
          <Spinner />
        </div>
      ) : null}

      <div className="flex items-center justify-between mt-6 bg-white rounded-xl border shadow-sm p-4">
        <div className="text-sm text-gray-500">
          {totalStudents === 0
            ? "Showing 0 students"
            : `Showing ${rangeStart} to ${rangeEnd} of ${totalStudents} students`}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">{editStudent ? "Edit Student" : "Add Student"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full border p-2 rounded"
                placeholder="First Name"
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                required
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Last Name"
                value={form.lastName}
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                required
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
              {!editStudent && (
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              )}
              <input
                className="w-full border p-2 rounded"
                placeholder="Grade Level"
                value={form.gradeLevel}
                onChange={e => setForm(f => ({ ...f, gradeLevel: e.target.value }))}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editStudent ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
