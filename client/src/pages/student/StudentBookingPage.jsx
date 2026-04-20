import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookSession } from "../../lib/api/common/bookingApi";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { useStudentBooking } from "../../hooks/student/useStudentBooking";
import { SlotButton } from "../../components/student/StudentBooking";
import Spinner from "../../components/common/Spinner";
import Calendar from "../../components/Calendar";
import { Check } from "lucide-react";
import {
  formatCalendarDate,
  formatDuration,
  formatSlotTime,
} from "../../utils/time";
import { useStudentTutorProfile } from "../../hooks/student/useStudentTutorProfile";
import BackButton from "../../components/common/BackButton";

// Progress Indicator Component
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-sm font-semibold transition-all ${
                isCompleted
                  ? "bg-primary text-white"
                  : isCurrent
                  ? "bg-primary text-white ring-4 ring-primary/20"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {isCompleted ? <Check size={16} /> : stepNumber}
            </div>
            {stepNumber < totalSteps && (
              <div
                className={`w-8 h-0.5 mx-1 ${
                  isCompleted ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Subject Selection Card
const SubjectCard = ({ subject, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(subject.id)}
      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{subject.name}</span>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            isSelected
              ? "border-primary bg-primary"
              : "border-gray-300 bg-white"
          }`}
        >
          {isSelected && <Check size={14} className="text-white" />}
        </div>
      </div>
    </button>
  );
};

export default function BookingSession() {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [subject, setSubject] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(
    formatCalendarDate(new Date(), "yyyy-MM")
  );

  const queryClient = useQueryClient();

  const {
    data: tutorProfile,
    isLoading: tutorLoading,
    error: tutorError,
  } = useStudentTutorProfile(id);

  const { availabilityData, availabilityLoading } = useStudentBooking(
    id,
    null,
    currentMonth
  );

  const bookingMutation = useMutation({
    mutationFn: bookSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["availability"],
        exact: true,
      });
      handleToastSuccess("Request Sent!");
      setStep(4);
    },
    onError: (error) => {
      queryClient.invalidateQueries({
        queryKey: ["availability"],
        exact: true,
      });
      handleToastError(error);
    },
  });

  const bookedDates = useMemo(() => {
    if (!availabilityData || availabilityData.length === 0) return [];
    const datesWithSlots = new Set();
    availabilityData.forEach((slot) => {
      const slotDate = formatCalendarDate(
        new Date(slot.scheduledStart),
        "yyyy-MM-dd"
      );
      datesWithSlots.add(slotDate);
    });
    return Array.from(datesWithSlots);
  }, [availabilityData]);

  const availableTimes = useMemo(() => {
    if (!selectedDate || !availabilityData) return [];
    return availabilityData
      .filter((slot) => {
        const slotDate = formatCalendarDate(
          new Date(slot.scheduledStart),
          "yyyy-MM-dd"
        );
        return slotDate === selectedDate;
      })
      .map((slot) => ({
        id: slot.id,
        start: slot.scheduledStart,
        end: slot.scheduledEnd,
        label: `${new Date(slot.scheduledStart).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })} - ${new Date(slot.scheduledEnd).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}`,
      }));
  }, [selectedDate, availabilityData]);

  const selectedSlot = availableTimes.find((s) => s.id === selectedSlotId);
  const selectedSubjectName = tutorProfile?.subjects?.find(
    (s) => s.id === Number(subject)
  )?.name;

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(month);
    if (selectedDate && !selectedDate.startsWith(month)) {
      setSelectedDate(null);
      setSelectedSlotId(null);
    }
  };

  if (tutorLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <Spinner />
        <p className="text-gray-600 mt-4">Loading tutor information...</p>
      </div>
    );
  }

  if (tutorError) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <p className="text-red-600 font-semibold">Failed to load tutor</p>
      </div>
    );
  }

  return (
    <div className="px-2 md:px-4">
      <BackButton to={-1} />
      <div className="max-w-5xl mx-auto">
        <div className="mb-4 md:mb-3">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Book Your Session
          </h1>
          <p className="text-center text-gray-600 text-sm">
            with {tutorProfile?.user?.firstName} {tutorProfile?.user?.lastName}
          </p>
        </div>

        <ProgressIndicator currentStep={step} totalSteps={4} />

        {/* Step 1: Subject Selection */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                What subject do you need help with?
              </h2>
              <p className="text-gray-600 text-sm">
                Choose from {tutorProfile?.user?.firstName}'s available subjects
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {tutorProfile?.subjects?.map((subj) => (
                <SubjectCard
                  key={subj.id}
                  subject={subj}
                  isSelected={subject === subj.id}
                  onClick={setSubject}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                disabled={!subject}
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                When would you like to meet?
              </h2>
              <p className="text-gray-600 text-sm">
                Select a date and available time slot
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Calendar */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Pick a Date
                </h3>
                <div className="flex justify-center">
                  <Calendar
                    compact={true}
                    bookingDates={bookedDates}
                    onDateClick={handleDateClick}
                    onMonthChange={handleMonthChange}
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Available Times
                  {selectedDate && (
                    <span className="text-gray-500 font-normal ml-2">
                      (
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      )
                    </span>
                  )}
                </h3>
                <div className="">
                  {availabilityLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Spinner />
                      <p className="text-gray-500 text-sm mt-2">
                        Loading times...
                      </p>
                    </div>
                  ) : !selectedDate ? (
                    <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
                      Select a date to see available times
                    </div>
                  ) : availableTimes.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
                      No available times for this date
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimes.map((slot) => (
                        <SlotButton
                          key={slot.id}
                          slot={slot}
                          selected={selectedSlotId === slot.id}
                          onClick={setSelectedSlotId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                disabled={!selectedDate || !selectedSlotId}
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Your Booking
              </h2>
              <p className="text-gray-600 text-sm">
                Please review your session details
              </p>
            </div>

            {/* Tutor Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <img
                src={tutorProfile?.user?.profileImageUrl || "https://via.placeholder.com/48x48?text=Tutor"}
                alt="Tutor"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {tutorProfile.user.firstName} {tutorProfile.user.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedSubjectName}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 text-sm">Subject</span>
                <span className="font-medium text-gray-900 text-sm">
                  {selectedSubjectName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 text-sm">Date</span>
                <span className="font-medium text-gray-900 text-sm">
                  {selectedDate && new Date(selectedDate).toDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 text-sm">Time</span>
                <span className="font-medium text-gray-900 text-sm">
                  {formatSlotTime(selectedSlot)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 text-sm">Duration</span>
                <span className="font-medium text-gray-900 text-sm">
                  {selectedSlot &&
                    formatDuration(selectedSlot.start, selectedSlot.end)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 text-sm">Mode</span>
                <span className="font-medium text-gray-900 text-sm">
                  Online Session
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() =>
                  bookingMutation.mutate({
                    bookingId: selectedSlotId,
                    subjectId: subject,
                  })
                }
                disabled={bookingMutation.isPending}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                {bookingMutation.isPending
                  ? "Confirming..."
                  : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Booking Request Sent!
              </h2>
              <p className="text-gray-600 text-sm">
                Your session request has been sent to{" "}
                {tutorProfile.user.firstName}
              </p>
            </div>

            {/* Booking Summary */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <img
                src={tutorProfile?.user?.profileImageUrl || "https://via.placeholder.com/48x48?text=Tutor"}
                alt="Tutor"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Online Session
                </p>
                <p className="text-xs text-gray-600">{selectedSubjectName}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-white rounded border border-gray-200">
                  {tutorProfile.user.firstName} {tutorProfile.user.lastName}
                </span>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <div className="flex justify-between py-1.5">
                <span className="text-gray-600 text-sm">Date</span>
                <span className="font-medium text-gray-900 text-sm">
                  {selectedDate && new Date(selectedDate).toDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-600 text-sm">Time</span>
                <span className="font-medium text-gray-900 text-sm">
                  {formatSlotTime(selectedSlot)}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-600 text-sm">Duration</span>
                <span className="font-medium text-gray-900 text-sm">
                  {selectedSlot &&
                    formatDuration(selectedSlot.start, selectedSlot.end)}
                </span>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-800">
                <strong>What's next?</strong> You'll receive an email
                notification once {tutorProfile.user.firstName} confirms your
                session. You can track your booking status from your sessions
                page.
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/student/dashboard"
                className="block w-full px-6 py-2 bg-primary text-white rounded-lg font-medium text-center hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSubject(null);
                  setSelectedSlotId(null);
                  setStep(1);
                }}
                className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Book Another Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
