import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useUsers } from "../../hooks/admin";
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
    header: "Name",
    cell: (student) => (
      <div className="flex items-center gap-3 min-w-[150px]">
        <img
          src={student.profileImageUrl}
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
              ? "bg-green-100 text-green-700"
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

const renderStudentCard = (student) => {
  const status = student?.accountStatus || student?.status || "—";
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <img
        src={student.profileImageUrl}
        alt={getUserName(student)}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />
      <p className="font-medium text-gray-900">{getUserName(student)}</p>
      <p className="text-sm text-gray-500 mt-1">{student?.email ?? "—"}</p>
      <div className="flex items-center justify-between pt-2">
        <span
          className={`inline-block px-3 py-1 text-xs rounded-full ${
            status === "active"
              ? "bg-green-100 text-green-700"
              : status === "inactive"
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </span>
        <Link
          className="px-4 py-2 bg-white border rounded-full shadow-sm text-blue-600"
          to={`/admin/students/${student?.id}`}
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useUsers({
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
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h1 className="text-2xl font-semibold">Students</h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage registered students and review their onboarding details.
        </p>
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
    </div>
  );
}
