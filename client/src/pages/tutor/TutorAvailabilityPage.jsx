import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createBookingAvailability,
  deleteBookingAvailability,
  updateBookingAvailability,
  fetchTutorBookings,
} from "../../lib/api/common/bookingApi";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import Button from "../../components/ui/Button";
import Spinner from "../../components/common/Spinner";
import {
  formatDate,
  formatTimeRange,
  fromUtcToLocalParts,
  makeAvailabilityPayload,
} from "../../utils/time";
import ErrorAlert from "../../components/common/ErrorAlert";
import DropdownPicker from "../../components/ui/DropdownPicker";
import {
  generateTimeSlots,
  getAvailableEndTimes,
  calculateDuration,
} from "../../utils/time";
import { useDateOptions } from "../../hooks/tutor/useDateOptions";

const TutorAvailabilityPage = () => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    scheduledStart: "",
    scheduledEnd: "",
    tutorNotes: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [editingAvailability, setEditingAvailability] = useState(null);

  const {
    data: availabilities,
    isLoading: isLoadingAvailabilities,
    isError: isErrorAvailabilities,
    error: availabilitiesError,
  } = useQuery({
    queryKey: ["tutorOpenAvailabilities"],
    queryFn: () => fetchTutorBookings({ status: "open" }),
  });

  const handleTimeChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "startTime") newData.endTime = "";
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.startTime || !formData.endTime) {
      return handleToastError(null, "Please select date, start, and end time.");
    }

    const dataToSend = makeAvailabilityPayload(
      formData.date,
      formData.startTime,
      formData.endTime,
      formData.tutorNotes
    );

    if (editingAvailability) {
      updateAvailabilityMutation.mutate({
        availabilityId: editingAvailability.id,
        updateData: dataToSend,
      });
    } else {
      createAvailabilityMutation.mutate(dataToSend);
    }
  };

  const handleEdit = (availability) => {
    setEditingAvailability(availability);
    const { date: startDate, time: startTime } = fromUtcToLocalParts(
      availability.scheduledStart
    );
    const { time: endTime } = fromUtcToLocalParts(availability.scheduledEnd);

    // Set form data with proper values
    const newFormData = {
      scheduledStart: availability.scheduledStart,
      scheduledEnd: availability.scheduledEnd,
      tutorNotes: availability.tutorNotes || "",
      date: startDate,
      startTime,
      endTime,
    };

    setFormData(newFormData);
  };

  const handleCancelEdit = () => {
    setEditingAvailability(null);
    setFormData({
      scheduledStart: "",
      scheduledEnd: "",
      tutorNotes: "",
      date: "",
      startTime: "",
      endTime: "",
    });
  };

  const createAvailabilityMutation = useMutation({
    mutationFn: createBookingAvailability,
    onSuccess: () => {
      handleToastSuccess("Availability added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["tutorOpenAvailabilities"],
        exact: true,
      });
      setFormData({
        scheduledStart: "",
        scheduledEnd: "",
        tutorNotes: "",
        date: "",
        startTime: "",
        endTime: "",
      });
    },
    onError: (err) => {
      handleToastError(err, "Failed to add availability.");
    },
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ availabilityId, updateData }) =>
      updateBookingAvailability(availabilityId, updateData),
    onSuccess: () => {
      handleToastSuccess("Availability updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["tutorOpenAvailabilities"],
        exact: true,
      });
      setEditingAvailability(null);
      setFormData({
        scheduledStart: "",
        scheduledEnd: "",
        tutorNotes: "",
        date: "",
        startTime: "",
        endTime: "",
      });
    },
    onError: (err) => {
      handleToastError(err, "Failed to update availability.");
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: deleteBookingAvailability,
    onSuccess: () => {
      handleToastSuccess("Availability deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["tutorOpenAvailabilities"],
        exact: true,
      });
    },
    onError: (err) => {
      handleToastError(err, "Failed to delete availability.");
    },
  });

  const dateOptions = useDateOptions(formData.date);

  if (isLoadingAvailabilities) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="large" />
      </div>
    );
  }

  if (isErrorAvailabilities) {
    return <ErrorAlert error={availabilitiesError} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-0">
      {createAvailabilityMutation.error && (
        <ErrorAlert error={createAvailabilityMutation.error} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Header & Form */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Manage Your Availability
            </h1>
            <p className="text-gray-600">
              Set your schedule to let students know when you're available for
              tutoring.
            </p>
          </div>

          {/* Create/Edit Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingAvailability ? "Edit Slot" : "Create New Slot"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <DropdownPicker
                label="Date"
                value={formData.date}
                onChange={(value) =>
                  setFormData((p) => ({ ...p, date: value }))
                }
                options={dateOptions}
                placeholder="Select Date"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="sm:flex-[2]">
                  <DropdownPicker
                    label="Start Time"
                    value={formData.startTime}
                    onChange={(value) => handleTimeChange("startTime", value)}
                    options={generateTimeSlots()}
                    placeholder="Select start time"
                  />
                </div>

                <div className="sm:flex-[3]">
                  <DropdownPicker
                    label="End Time"
                    value={formData.endTime}
                    onChange={(value) => handleTimeChange("endTime", value)}
                    options={getAvailableEndTimes(formData.startTime)}
                    disabled={!formData.startTime}
                    placeholder={
                      formData.startTime
                        ? "Select end time"
                        : "Select start time first"
                    }
                  />
                </div>
              </div>

              {formData.startTime && formData.endTime && (
                <div className="text-sm text-gray-600 bg-green-100 rounded-50 px-3 py-2 rounded-md">
                  Duration:{" "}
                  {calculateDuration(formData.startTime, formData.endTime)}{" "}
                  minutes
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 sm:mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.tutorNotes}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, tutorNotes: e.target.value }))
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                  placeholder="e.g., Available for advanced topics in Algebra."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:gap-2 sm:pt-2">
                {editingAvailability && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <Button
                  type="submit"
                  loading={
                    createAvailabilityMutation.isPending ||
                    updateAvailabilityMutation.isPending
                  }
                  disabled={
                    createAvailabilityMutation.isPending ||
                    updateAvailabilityMutation.isPending
                  }
                >
                  {editingAvailability
                    ? "Update Availability"
                    : "Add Availability"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Availability List */}
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Upcoming Availability
          </h2>

          {availabilities?.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
              <p className="text-gray-500">
                No availabilities set yet. Add one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availabilities?.map((availability) => (
                <div
                  key={availability.id}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(availability.scheduledStart)}
                        </h3>
                        {availability.status === "open" && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Open
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm">
                          {formatTimeRange(
                            availability.scheduledStart,
                            availability.scheduledEnd
                          )}
                        </span>
                      </div>

                      <div className="min-h-[20px]">
                        {availability.tutorNotes && (
                          <p className="text-sm text-gray-600">
                            Note: {availability.tutorNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 sm:ml-4">
                      <button
                        onClick={() => handleEdit(availability)}
                        className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors whitespace-nowrap"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          deleteAvailabilityMutation.mutate(availability.id)
                        }
                        disabled={deleteAvailabilityMutation.isPending}
                        className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {deleteAvailabilityMutation.isPending ? (
                          <Spinner />
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorAvailabilityPage;
