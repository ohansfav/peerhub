import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { usePendingTutors, useUserCounts, useUsers } from "../../hooks/admin";
import ResponsiveDataSection from "../../components/admin/ResponsiveDataSection";

const PREVIEW_LIMIT = 5;

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "0";
  }

  return new Intl.NumberFormat().format(value);
}

function formatDate(value) {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
    return date.toLocaleDateString();
  } catch (error) {
    return "—";
  }
}

function getUserName(user) {
  if (!user) return "—";
  const userDetails = user.user || user;
  if (userDetails.fullName) return userDetails.fullName;
  const nameParts = [userDetails.firstName, userDetails.lastName].filter(Boolean);
  if (nameParts.length) return nameParts.join(" ");
  return userDetails.name || "—";
}

// --- Config for Pending Tutors ---
const tutorColumns = [
  {
    header: "Name",
    cell: (tutor) => (
      <div className="flex items-center gap-3 min-w-[150px]">
        <img
          src={tutor.user.profileImageUrl}
          alt={getUserName(tutor)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
        />
        <span className="text-sm text-gray-700 break-words">
          {getUserName(tutor)}
        </span>
      </div>
    ),
  },
  {
    header: "Bio",
    cellClassName: "text-gray-600 text-xs sm:text-sm max-w-[200px] truncate break-words",
    cell: (tutor) => tutor?.bio ?? "-",
  },
  {
    header: "Date Applied",
    cellClassName: "text-gray-600 whitespace-nowrap",
    cell: (tutor) => formatDate(tutor?.user.createdAt),
  },
];

const renderTutorCard = (tutor) => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex items-center gap-3">
      <img
        src={tutor.user.profileImageUrl}
        alt={getUserName(tutor)}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {getUserName(tutor)}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatDate(tutor?.user.createdAt)}
        </p>
      </div>
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-1">Bio</p>
      <p className="text-sm text-gray-700 line-clamp-2">{tutor?.bio ?? "-"}</p>
    </div>
    <div className="pt-2">
      <Link
        className="block w-full text-center px-4 py-2 bg-white border rounded-full shadow-sm text-blue-600 text-sm"
        to={`/admin/tutors/${tutor?.id}`}
      >
        View
      </Link>
    </div>
  </div>
);

// --- Config for Registered Students ---
const studentColumns = [
  {
    header: "Name",
    cell: (student) => (
      <div className="flex items-center gap-3">
        <img
          src={student.profileImageUrl}
          alt={getUserName(student)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
        />
        <span className="text-sm text-gray-700 truncate max-w-[120px] sm:max-w-none">
          {getUserName(student)}
        </span>
      </div>
    ),
  },
  {
    header: "Date Joined",
    cellClassName: "text-gray-600",
    cell: (student) => formatDate(student?.createdAt),
  },
  {
    header: "Status",
    cell: (student) => {
      const status = student?.accountStatus || "—";
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
  const status = student?.accountStatus || "—";
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={student.profileImageUrl}
          alt={getUserName(student)}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {getUserName(student)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(student?.createdAt)}
          </p>
        </div>
      </div>
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
          className="px-4 py-1.5 bg-white border rounded-full shadow-sm text-blue-600 text-sm"
          to={`/admin/students/${student?.id}`}
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const {
    data: counts,
    isLoading: isLoadingCounts,
    isError: isCountsError,
    error: countsError,
  } = useUserCounts();
  const {
    data: pendingTutors,
    isLoading: isLoadingPendingTutors,
    isError: isPendingTutorsError,
    error: pendingTutorsError,
  } = usePendingTutors();
  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    isError: isStudentsError,
    error: studentsError,
  } = useUsers({ role: "student", limit: PREVIEW_LIMIT });

  const pendingTutorPreview = (pendingTutors ?? []).slice(0, PREVIEW_LIMIT);
  const studentPreview = (studentsData?.users ?? []).slice(0, PREVIEW_LIMIT);

  const statCards = useMemo(
    () => [
      {
        title: "Total Tutors",
        value: formatNumber(counts?.totals?.totalTutors ?? 0),
        delta: counts?.growth?.tutors ?? null,
        deltaClass:
          typeof counts?.growth?.tutors === "number" &&
          counts?.growth?.tutors < 0
            ? "text-red-500"
            : "text-green-600",
      },
      {
        title: "Total Students",
        value: formatNumber(counts?.totals?.totalStudents ?? 0),
        delta: counts?.growth?.students ?? null,
        deltaClass:
          typeof counts?.growth?.students === "number" &&
          counts?.growth?.students < 0
            ? "text-red-500"
            : "text-green-600",
      },
      {
        title: "Pending Tutor Application",
        value: formatNumber(counts?.totals?.totalPendingTutors ?? 0),
        delta: counts?.growth?.pendingTutors ?? null,
        deltaClass:
          typeof counts?.growth?.pendingTutors === "number" &&
          counts?.growth?.pendingTutors < 0
            ? "text-green-600"
            : "text-red-500",
      },
    ],
    [counts]
  );

  return (
    <div className="space-y-8 p-2 sm:p-0">
      {/* --- Stats cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isCountsError ? (
          <div className="sm:col-span-3">
            <ErrorAlert error={countsError} />
          </div>
        ) : null}

        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl p-5 shadow-sm border min-h-[120px] flex flex-col justify-between"
          >
            <div className="text-sm text-gray-500">{card.title}</div>
            {isLoadingCounts ? (
              <div className="py-4">
                <Spinner />
              </div>
            ) : (
              <>
                <div className="mt-3 text-2xl font-semibold">{card.value}</div>
                <div className={`mt-2 text-sm ${card.deltaClass}`}>
                  {card.delta != null ? `${card.delta}%` : "—"}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* --- Pending tutors --- */}
      <ResponsiveDataSection
        title="Pending Tutors Approval"
        data={pendingTutorPreview}
        columns={tutorColumns}
        renderCard={renderTutorCard}
        getLink={(tutor) => `/admin/tutors/${tutor.id}`}
        isLoading={isLoadingPendingTutors}
        error={pendingTutorsError}
        viewAllLink="/admin/tutors"
        emptyMessage="No pending tutors at the moment."
        getRowKey={(tutor) => tutor.id}
      />

      {/* --- Students --- */}
      <ResponsiveDataSection
        title="Registered Students"
        data={studentPreview}
        columns={studentColumns}
        renderCard={renderStudentCard}
        getLink={(student) => `/admin/students/${student.id}`}
        isLoading={isLoadingStudents}
        error={studentsError}
        viewAllLink="/admin/students"
        emptyMessage="No students found."
        getRowKey={(student) => student.id}
      />
    </div>
  );
}
