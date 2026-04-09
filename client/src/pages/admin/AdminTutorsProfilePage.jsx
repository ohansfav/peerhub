import { X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import {
  useApproveTutor,
  useRejectTutor,
  usePendingTutor,
} from "../../hooks/admin";
import {
  ApproveTutorModal,
  RejectTutorModal,
} from "../../components/admin/ApprovalModals";

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-gray-50 text-sm"
      type="button"
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Back
    </button>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 mr-2">
      <span className="w-2 h-2 rounded-full bg-blue-700 inline-block" />{" "}
      {children}
    </span>
  );
}

function DocumentRow({ doc, onView }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
          />
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 2v6h6"
          />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900  break-all ">
          {doc.title}
        </div>
        <div className="text-xs text-gray-500 break-all ">{doc.subtitle}</div>
      </div>

      <button
        onClick={() => onView(doc)}
        className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        type="button"
      >
        View
      </button>
    </div>
  );
}

function extractFileName(url) {
  try {
    // Decode the URL first
    const decodedUrl = decodeURIComponent(url);

    // Extract everything after the last '/' and before any '?'
    const urlParts = decodedUrl.split("?")[0].split("/");
    let filename = urlParts[urlParts.length - 1];

    // Remove common cloud storage prefixes/hashes if present
    // Example: "1234567890_document.pdf" -> "document.pdf"
    filename = filename.replace(/^\d+[-_]/, "");

    // If it's a signed URL with tokens, clean it up
    filename = filename.split("?")[0];

    return filename || "Document";
  } catch {
    return "Document";
  }
}

export default function AdminTutorsProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tutor, isLoading, isError, error } = usePendingTutor(id);

  const approveTutor = useApproveTutor({ onSuccess: () => navigate(-1) });
  const rejectTutor = useRejectTutor({ onSuccess: () => navigate(-1) });

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const documents = useMemo(() => {
    if (!tutor?.documentUrl) return [];
    const subtitle = extractFileName(tutor.documentUrl);
    return [
      {
        id: "primary-document",
        title: "Verification Document",
        subtitle,
        url: tutor.documentUrl,
      },
    ];
  }, [tutor]);

  const handleViewDocument = (doc) => {
    if (!doc?.url) return alert("Document URL unavailable.");
    window.open(doc.url, "_blank", "noopener");
  };

  const confirmApprove = () => {
    approveTutor.mutate(id);
    setShowApproveModal(false);
  };

  const confirmReject = (reason) => {
    rejectTutor.mutate({ tutorId: id, rejectionReason: reason });
    setShowRejectModal(false);
  };

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorAlert error={error} />;
  if (!tutor) return <p className="text-sm text-gray-500">Tutor not found.</p>;

  return (
    <div className="relative w-full max-w-full overflow-x-hidden -mx-1">
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4">
              <BackButton onClick={() => navigate(-1)} />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Tutor Profile Review
            </h1>
            <p className="text-sm text-gray-600">
              Review tutor information, documents, and approve or reject this
              application.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6">
              <img
                src={tutor.user.profileImageUrl}
                alt={`${tutor.user.firstName} ${tutor.user.lastName}`}
                className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0 flex-shrink-0 border-2 border-gray-100"
              />

              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center sm:text-left">
                    {tutor.user.firstName} {tutor.user.lastName}
                  </h2>
                  <div className="flex justify-center sm:justify-start">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${
                        tutor.approvalStatus === "approved"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : tutor.approvalStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : tutor.approvalStatus === "rejected"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {tutor.approvalStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-sm font-medium text-gray-700 sm:min-w-[80px]">
                      Email:
                    </span>
                    <span className="text-sm text-gray-600 break-all">
                      {tutor.user.email}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                    <span className="text-sm font-medium text-gray-700 sm:min-w-[80px] flex-shrink-0">
                      Bio:
                    </span>
                    <span className="text-sm text-gray-600">
                      {tutor.bio || "No bio provided."}
                    </span>
                  </div>

                  {tutor.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-800 mb-1">
                        Previous Rejection Reason:
                      </div>
                      <div className="text-sm text-red-700">
                        {tutor.rejectionReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Academic History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Academic History
            </h3>
            <div className="text-sm text-gray-700 leading-relaxed break-all">
              {tutor.education || "No education details provided."}
            </div>

            {tutor.subjects?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <Tag key={subject.id}>{subject.name}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Documents
            </h3>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-500">No documents available.</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    onView={handleViewDocument}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {(tutor.approvalStatus === "pending" ||
            tutor.approvalStatus === "rejected") && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={approveTutor.isPending}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors"
              >
                {approveTutor.isPending ? "Approving..." : "Approve Tutor"}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={rejectTutor.isPending}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors"
              >
                {rejectTutor.isPending ? "Rejecting..." : "Reject Tutor"}
              </button>
            </div>
          )}

          {/* Your existing modals */}
          <ApproveTutorModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            tutorName={tutor.user.firstName}
            onConfirm={confirmApprove}
            isLoading={approveTutor.isPending}
          />

          <RejectTutorModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            tutorName={tutor.user.firstName}
            onConfirm={confirmReject}
            isLoading={rejectTutor.isPending}
          />
        </div>
      </div>
    </div>
  );
}
