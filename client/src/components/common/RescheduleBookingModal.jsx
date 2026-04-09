import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { rescheduleBooking } from "../../lib/api/common/bookingApi";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import DropdownPicker from "../../components/ui/DropdownPicker";
import {
  generateTimeSlots,
  getAvailableEndTimes,
  calculateDuration,
  makeReschedulePayload,
  fromUtcToLocalParts,
} from "../../utils/time";
import { useDateOptions } from "../../hooks/tutor/useDateOptions";

const RescheduleBookingModal = ({ booking, isOpen, onClose, onReschedule }) => {
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const rescheduleBookingMutation = useMutation({
    mutationFn: (data) => rescheduleBooking(booking.id, data),
    onSuccess: () => {
      handleToastSuccess("Booking rescheduled successfully!");
      onClose();
      onReschedule();
    },
    onError: (err) => {
      handleToastError(err, "Failed to reschedule booking.");
    },
  });

  // 🔹 Pre-fill with existing booking schedule
  useEffect(() => {
    if (booking) {
      const { date: startDate, time: startTime } = fromUtcToLocalParts(
        booking.scheduledStart
      );
      const { time: endTime } = fromUtcToLocalParts(booking.scheduledEnd);

      setFormData({
        date: startDate,
        startTime,
        endTime,
      });
    }
  }, [booking]);

  const dateOptions = useDateOptions(formData.date);

  if (!isOpen || !booking) {
    return null;
  }

  // 🔹 Handle field updates
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "startTime" ? { endTime: "" } : {}), // reset endTime if start changes
    }));
  };

  // 🔹 Submit reschedule
  const handleReschedule = () => {
    const { date, startTime, endTime } = formData;
    if (!date || !startTime || !endTime) {
      handleToastError(null, "Please select a date, start time, and end time.");
      return;
    }

    rescheduleBookingMutation.mutate(
      makeReschedulePayload(date, startTime, endTime)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Reschedule Booking</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Date Picker */}
          <DropdownPicker
            label="Date"
            value={formData.date}
            onChange={(val) => handleChange("date", val)}
            options={dateOptions}
            placeholder="Select a date"
          />

          {/* Time Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DropdownPicker
              label="Start Time"
              value={formData.startTime}
              onChange={(val) => handleChange("startTime", val)}
              options={generateTimeSlots()}
              placeholder="Select start time"
            />

            <DropdownPicker
              label="End Time"
              value={formData.endTime}
              onChange={(val) => handleChange("endTime", val)}
              options={getAvailableEndTimes(formData.startTime)}
              disabled={!formData.startTime}
              placeholder={
                formData.startTime
                  ? "Select end time"
                  : "Select start time first"
              }
            />
          </div>

          {/* Duration Display */}
          {formData.startTime && formData.endTime && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                Session Duration:{" "}
                {calculateDuration(formData.startTime, formData.endTime)}{" "}
                minutes
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            className="btn btn-primary btn-primary-focus text-white"
            disabled={
              !formData.date ||
              !formData.startTime ||
              !formData.endTime ||
              rescheduleBookingMutation.isPending
            }
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleBookingModal;
