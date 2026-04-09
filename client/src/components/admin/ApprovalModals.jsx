import { useState } from "react";
import { Modal } from "./AdminModal";

export function ApproveTutorModal({
  isOpen,
  onClose,
  tutorName,
  onConfirm,
  isLoading,
}) {
  return (
    <Modal isOpen={isOpen} title="Approve Tutor" onClose={onClose}>
      <p className="text-gray-600 mb-4">
        Are you sure you want to approve <b>{tutorName}</b> as a tutor?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "Approving..." : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}

export function RejectTutorModal({
  isOpen,
  onClose,
  tutorName,
  onConfirm,
  isLoading,
}) {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = () => {
    onConfirm(rejectionReason);
    setRejectionReason("");
  };

  const handleClose = () => {
    setRejectionReason("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} title="Reject Tutor" onClose={handleClose}>
      <p className="text-gray-600 mb-3">
        Please provide a rejection reason for <b>{tutorName}</b>:
      </p>
      <textarea
        value={rejectionReason}
        onChange={(e) => setRejectionReason(e.target.value)}
        rows={3}
        className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter reason..."
        disabled={isLoading}
      />
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
          disabled={isLoading || !rejectionReason.trim()}
        >
          {isLoading ? "Rejecting..." : "Submit"}
        </button>
      </div>
    </Modal>
  );
}
