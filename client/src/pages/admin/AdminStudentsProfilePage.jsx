import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useAdminUser } from "../../hooks/admin";

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50 text-sm"
      aria-label="Back"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M15 19l-7-7 7-7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back
    </button>
  );
}

function getFullName(user) {
  if (!user) return "—";
  if (user.fullName) return user.fullName;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return user.name || "—";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
    return date.toLocaleString();
  } catch (error) {
    return "—";
  }
}

export default function AdminStudentsProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: student, isLoading, isError, error } = useAdminUser({ id });

  const learningGoals = Array.isArray(student?.student?.learningGoals)
    ? student.student.learningGoals
    : [];

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <BackButton onClick={() => navigate(-1)} />
        <div>
          <h1 className="text-2xl font-semibold">Student profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review student onboarding details and account status.
          </p>
        </div>
      </div>

      {isError ? <ErrorAlert error={error} /> : null}

      {isLoading ? (
        <Spinner />
      ) : !student ? (
        <p className="text-sm text-gray-500">Student not found.</p>
      ) : (
        <>
          <section className="bg-white border rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap gap-6">
              <img
                src={student.profileImageUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-28 h-28 rounded-full object-cover"
              />
              <div className="flex-1 min-w-[220px] space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium text-gray-800">Full name:</span>{" "}
                  {getFullName(student)}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Email:</span>{" "}
                  {student.email ?? "—"}
                </div>
                <div>
                  <span className="font-medium text-gray-800">
                    Account status:
                  </span>{" "}
                  {student.accountStatus ?? "—"}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Role:</span>{" "}
                  {student.role ?? "—"}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Created:</span>{" "}
                  {formatDate(student.createdAt)}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Last login:</span>{" "}
                  {formatDate(student.lastLogin)}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Learning preferences</h2>
              <p className="text-sm text-gray-500">
                Insights gathered from the student's onboarding form.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <div className="font-medium text-gray-800">Grade level</div>
                <div className="mt-1 text-gray-600">
                  {student?.student?.gradeLevel ?? "Not provided"}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  Verification status
                </div>
                <div className="mt-1 text-gray-600">
                  {student?.isVerified ? "Verified" : "Pending"}
                </div>
              </div>
            </div>

            <div>
              <div className="font-medium text-gray-800 mb-2">
                Learning goals
              </div>
              {learningGoals.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No learning goals provided.
                </p>
              ) : (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {learningGoals.map((goal, index) => (
                    <li key={`${goal}-${index}`}>{goal}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
