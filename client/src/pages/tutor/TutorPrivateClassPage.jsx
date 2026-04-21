import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStudentDirectory } from "../../lib/api/common/studentApi";
import {
  startOfflineClass,
  getActiveOfflineClasses,
  endOfflineClass,
} from "../../lib/api/common/offlineClassApi";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useAuth } from "../../hooks/useAuthContext";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";

const TutorPrivateClassPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser } = useAuth();
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [maxStudents, setMaxStudents] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const {
    data: studentDirectory,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tutor-private-class-students", searchTerm],
    queryFn: () =>
      fetchStudentDirectory({
        limit: 200,
        search: searchTerm,
      }),
  });

  const privateClassMutation = useMutation({
    mutationFn: startOfflineClass,
    onError: (mutationError) => {
      handleToastError(mutationError, "Failed to start private class.");
    },
  });

  const { data: activeOfflineClasses = [] } = useQuery({
    queryKey: ["activeOfflineClasses"],
    queryFn: getActiveOfflineClasses,
    refetchInterval: 10000,
  });

  const endPrivateClassMutation = useMutation({
    mutationFn: endOfflineClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeOfflineClasses"] });
      handleToastSuccess("Private class ended successfully.");
    },
    onError: (error) => {
      handleToastError(error, "Failed to end private class.");
    },
  });

  const students = studentDirectory || [];

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedStudentIds.includes(student.id)),
    [students, selectedStudentIds]
  );

  const selectedStudentsById = useMemo(
    () =>
      selectedStudents.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {}),
    [selectedStudents]
  );

  const canToggleStudent = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      return true;
    }
    return selectedStudentIds.length < maxStudents;
  };

  const handleToggleStudent = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
      return;
    }

    if (selectedStudentIds.length >= maxStudents) {
      handleToastError(null, `You can select up to ${maxStudents} student(s).`);
      return;
    }

    setSelectedStudentIds((prev) => [...prev, studentId]);
  };

  const ensureSelectedStudent = () => {
    if (selectedStudents.length === 0) {
      handleToastError(null, "Please select at least one student first.");
      return false;
    }
    return true;
  };

  const selectedStudentLabel =
    selectedStudents.length === 1
      ? selectedStudents[0].fullName
      : `${selectedStudents.length} Students`;

  const parseParticipantIds = (liveClass) => {
    const raw = String(liveClass?.participantUserIdsJson || "").trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map(String);
        }
      } catch {
        // ignore invalid payloads
      }
    }

    if (liveClass?.participantUserId) {
      return [String(liveClass.participantUserId)];
    }

    return [];
  };

  const isSameIds = (first, second) => {
    if (first.length !== second.length) {
      return false;
    }
    const sortedFirst = [...first].sort();
    const sortedSecond = [...second].sort();
    return sortedFirst.every((id, index) => id === sortedSecond[index]);
  };

  const privateClassesForTutor = activeOfflineClasses.filter((liveClass) => {
    if (String(liveClass.tutorId) !== String(authUser?.id)) {
      return false;
    }
    return parseParticipantIds(liveClass).length > 0;
  });

  const selectedPrivateClass =
    selectedStudentIds.length > 0
      ? privateClassesForTutor.find((liveClass) =>
          isSameIds(parseParticipantIds(liveClass), selectedStudentIds.map(String))
        )
      : privateClassesForTutor[0];

  const handleStartPrivateClassroomChat = async () => {
    if (!ensureSelectedStudent()) {
      return;
    }

    const liveClass = await privateClassMutation.mutateAsync({
      title: `Private Classroom Chat - ${selectedStudentLabel}`,
      participantUserIds: selectedStudents.map((student) => student.id),
    });

    handleToastSuccess(`Private classroom chat is ready for ${selectedStudentLabel}.`);
    queryClient.invalidateQueries({ queryKey: ["activeOfflineClasses"] });
    navigate(`/tutor/classroom-chat/${liveClass.id}`);
  };

  const handleStartPrivateOfflineClass = async () => {
    if (!ensureSelectedStudent()) {
      return;
    }

    const liveClass = await privateClassMutation.mutateAsync({
      title: `Private Offline Class - ${selectedStudentLabel}`,
      participantUserIds: selectedStudents.map((student) => student.id),
    });

    handleToastSuccess(`Private offline class is ready for ${selectedStudentLabel}.`);
    queryClient.invalidateQueries({ queryKey: ["activeOfflineClasses"] });
    navigate(`/tutor/live-class/${liveClass.id}`);
  };

  const handleEndPrivateClass = async () => {
    if (!selectedPrivateClass?.id) {
      handleToastError(null, "No active private class to end.");
      return;
    }

    await endPrivateClassMutation.mutateAsync(selectedPrivateClass.id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (isError) {
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-0">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Private Class</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add any student you want using the plus button, then start a private classroom chat or
          private offline class.
        </p>

        <div className="mt-6">
          <label htmlFor="private-class-max" className="mb-2 block text-sm font-semibold text-slate-700">
            Number of students
          </label>
          <input
            id="private-class-max"
            type="number"
            min={1}
            max={Math.max(1, students.length)}
            value={maxStudents}
            onChange={(event) => {
              const nextValue = Math.max(1, Math.min(Number(event.target.value || 1), Math.max(1, students.length)));
              setMaxStudents(nextValue);
              setSelectedStudentIds((prev) => prev.slice(0, nextValue));
            }}
            className="w-40 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
          />
          <p className="mt-2 text-xs text-slate-500">
            Selected: {selectedStudents.length} / {maxStudents}
          </p>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsStudentModalOpen(true)}
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            + Add Student
          </button>
        </div>

        {selectedStudentIds.length > 0 && (
          <div className="mt-4 rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">Added Students</p>
            <div className="flex flex-wrap gap-2">
              {selectedStudentIds.map((studentId) => {
                const student = selectedStudentsById[studentId];
                return (
                  <button
                    key={studentId}
                    type="button"
                    onClick={() =>
                      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId))
                    }
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                  >
                    {student?.fullName || "Selected Student"} x
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {students.length === 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No students found for this search.
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleStartPrivateClassroomChat}
            disabled={selectedStudents.length === 0 || privateClassMutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Start Classroom Chat
          </button>
          <button
            onClick={handleStartPrivateOfflineClass}
            disabled={selectedStudents.length === 0 || privateClassMutation.isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            Start Private Offline Class
          </button>
          <button
            onClick={handleEndPrivateClass}
            disabled={!selectedPrivateClass?.id || endPrivateClassMutation.isPending}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            End Private Class
          </button>
        </div>
      </div>

      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Choose Students</h2>
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="rounded-md px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
            />

            <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-slate-200 p-3">
              <div className="space-y-2">
                {students.map((student) => {
                  const checked = selectedStudentIds.includes(student.id);
                  const disabled = !canToggleStudent(student.id);

                  return (
                    <label
                      key={student.id}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                        checked ? "bg-indigo-50" : "bg-white"
                      } ${disabled ? "opacity-60" : ""}`}
                    >
                      <div>
                        <p className="font-medium text-slate-800">{student.fullName}</p>
                        {student.email ? (
                          <p className="text-xs text-slate-500">{student.email}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleToggleStudent(student.id)}
                        className={`h-8 w-8 rounded-full text-base font-bold ${
                          checked
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        } disabled:opacity-60`}
                        aria-label={checked ? `Remove ${student.fullName}` : `Add ${student.fullName}`}
                        title={checked ? "Remove student" : "Add student"}
                      >
                        {checked ? "-" : "+"}
                      </button>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorPrivateClassPage;
