import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { formatDate, formatTimeRange } from "../../utils/time";
import BookingCard from "./BookingCard";

const ViewModal = ({
  isOpen,
  onClose,
  session,
  updateBookingStatusMutation,
}) => {
  const [status, setStatus] = useState(null);

  const handleClose = () => {
    setStatus(null);
    onClose();
  };

  const handleAccept = () => {
    updateBookingStatusMutation.mutate(
      { availabilityId: session.id, status: "confirmed" },
      {
        onSuccess: () => {
          setStatus("accepted");
        },
      }
    );
  };

  const handleDecline = () => {
    updateBookingStatusMutation.mutate(
      { availabilityId: session.id, status: "open" },
      {
        onSuccess: () => {
          setStatus("rejected");
        },
      }
    );
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {status ? (
          <>
            {status === "accepted" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Request Accepted
                  </h3>
                  <p className="text-sm text-gray-600">
                    You've accepted a booking request from{" "}
                    {`${session?.student?.user?.firstName} ${session?.student?.user?.lastName}`}
                    . A notification has been sent.
                  </p>
                </div>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => {
                    handleClose();
                  }}
                  style={{ backgroundColor: "#4CA1F0", color: "white" }}
                >
                  Done
                </button>
              </div>
            )}
            {status === "rejected" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Request Declined
                  </h3>
                  <p className="text-sm text-gray-600">
                    You've declined the booking request from{" "}
                    {`${session?.student?.user?.firstName} ${session?.student?.user?.lastName}`}
                    .
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    className="btn bg-primary w-full hover:bg-primary-focus text-white"
                    onClick={() => {
                      handleClose();
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <BookingCard session={session} />
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Date & Time</h4>
              <p className="text-sm font-semibold">
                Date: {formatDate(session?.scheduledStart)}
              </p>
              <p className="text-sm text-gray-600">
                {formatTimeRange(
                  session?.scheduledStart,
                  session?.scheduledEnd
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="btn text-white bg-primary hover:bg-primary-focus flex-1 rounded-full"
              >
                Accept Request
              </button>
              <button
                onClick={handleDecline}
                className="btn btn-outline flex-1 rounded-full"
              >
                Decline
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewModal;
