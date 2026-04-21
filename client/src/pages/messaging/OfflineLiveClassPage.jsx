import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useAuth } from "../../hooks/useAuthContext";
import {
  endOfflineClass,
  getActiveOfflineClasses,
  getOfflineClassById,
  getOfflineClassFrame,
  getOfflineClassParticipantFrame,
  updateOfflineClassFrame,
  updateOfflineClassParticipantFrame,
} from "../../lib/api/common/offlineClassApi";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";

const CAPTURE_INTERVAL_MS = 1000;

const LAST_FRAME_STALE_AFTER_MS = 8000;

const isNotFoundError = (error) => error?.response?.status === 404;

const OfflineLiveClassPage = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const autoStartedRef = useRef(false);
  const canvasRef = useRef(document.createElement("canvas"));
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const classQuery = useQuery({
    queryKey: ["offlineClass", classId],
    queryFn: () => getOfflineClassById(classId),
    staleTime: 1000 * 5,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    enabled: Boolean(classId),
  });

  const isClassLinkNotFound = classQuery.isError && isNotFoundError(classQuery.error);

  const activeClassesQuery = useQuery({
    queryKey: ["activeOfflineClassesFallback"],
    queryFn: getActiveOfflineClasses,
    enabled: Boolean(authUser?.role) && isClassLinkNotFound,
    retry: false,
    staleTime: 0,
  });

  const frameQuery = useQuery({
    queryKey: ["offlineClassFrame", classId],
    queryFn: () => getOfflineClassFrame(classId),
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    enabled: Boolean(classId),
  });

  const participantFrameQuery = useQuery({
    queryKey: ["offlineClassParticipantFrame", classId],
    queryFn: async () => {
      try {
        return await getOfflineClassParticipantFrame(classId);
      } catch (error) {
        if (isNotFoundError(error)) {
          return null;
        }
        throw error;
      }
    },
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    enabled: Boolean(classId),
    retry: false,
  });

  const uploadFrameMutation = useMutation({
    mutationFn: ({ frameDataUrl }) =>
      updateOfflineClassFrame({ classId, frameDataUrl }),
    onError: (error) => {
      handleToastError(error, "Could not publish your camera frame.");
    },
  });

  const uploadParticipantFrameMutation = useMutation({
    mutationFn: ({ frameDataUrl }) =>
      updateOfflineClassParticipantFrame({ classId, frameDataUrl }),
    onError: (error) => {
      if (isNotFoundError(error)) {
        handleToastError(
          null,
          "Student camera sharing is unavailable right now. Please restart backend server and re-open the class.",
        );
        return;
      }
      handleToastError(error, "Could not publish your camera frame.");
    },
  });

  const endClassMutation = useMutation({
    mutationFn: () => endOfflineClass(classId),
    onSuccess: () => {
      handleToastSuccess("Offline class ended.");
      navigate("/tutor/virtual-classes");
    },
    onError: (error) => {
      handleToastError(error, "Could not end offline class.");
    },
  });

  const liveClass = classQuery.data;

  const isTutorHost = useMemo(
    () =>
      Boolean(
        liveClass?.tutorId &&
          authUser?.id &&
          String(authUser.id) === String(liveClass.tutorId),
      ),
    [liveClass?.tutorId, authUser?.id],
  );

  const isFrameStale = useMemo(() => {
    const lastFrameAt = frameQuery.data?.lastFrameAt;
    if (!lastFrameAt) return true;
    return Date.now() - new Date(lastFrameAt).getTime() > LAST_FRAME_STALE_AFTER_MS;
  }, [frameQuery.data?.lastFrameAt]);

  const isParticipantFrameStale = useMemo(() => {
    const lastFrameAt = participantFrameQuery.data?.lastFrameAt;
    if (!lastFrameAt) return true;
    return Date.now() - new Date(lastFrameAt).getTime() > LAST_FRAME_STALE_AFTER_MS;
  }, [participantFrameQuery.data?.lastFrameAt]);

  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setIsBroadcasting(false);
    };
  }, []);

  useEffect(() => {
    if (!isTutorHost || autoStartedRef.current || !liveClass?.isActive) {
      return;
    }

    autoStartedRef.current = true;
    handleStartBroadcast({ showStartToast: false });
  }, [isTutorHost, liveClass?.isActive]);

  useEffect(() => {
    if (!isClassLinkNotFound) {
      return;
    }

    const fallbackClassId = activeClassesQuery.data?.[0]?.id;
    if (!fallbackClassId || !authUser?.role || fallbackClassId === classId) {
      return;
    }

    handleToastSuccess("Redirected you to the active live class.");
    navigate(`/${authUser.role}/live-class/${fallbackClassId}`, { replace: true });
  }, [
    isClassLinkNotFound,
    activeClassesQuery.data,
    authUser?.role,
    classId,
    navigate,
  ]);

  const handleStopBroadcast = () => {
    if (captureIntervalRef.current) {
      window.clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsBroadcasting(false);
  };

  const handleStartBroadcast = async ({ showStartToast = true } = {}) => {
    try {
      if (isBroadcasting) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current);
      }

      setIsBroadcasting(true);

      const publishSnapshot = async () => {
        const videoEl = videoRef.current;
        if (!videoEl || videoEl.readyState < 2) {
          return;
        }

        const canvas = canvasRef.current;
        canvas.width = 640;
        canvas.height = 360;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const frameDataUrl = canvas.toDataURL("image/jpeg", 0.65);

        if (isTutorHost) {
          await uploadFrameMutation.mutateAsync({ frameDataUrl });
          return;
        }

        await uploadParticipantFrameMutation.mutateAsync({ frameDataUrl });
      };

      publishSnapshot();

      captureIntervalRef.current = window.setInterval(() => {
        const isPublishPending = isTutorHost
          ? uploadFrameMutation.isPending
          : uploadParticipantFrameMutation.isPending;

        if (isPublishPending) return;
        publishSnapshot();
      }, CAPTURE_INTERVAL_MS);

      if (showStartToast) {
        handleToastSuccess(
          isTutorHost
            ? "Offline class broadcast is live."
            : "Your camera is now shared with the tutor.",
        );
      }
    } catch (error) {
      handleStopBroadcast();
      handleToastError(error, "Unable to access camera for offline class.");
    }
  };

  if (classQuery.isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (classQuery.isError) {
    if (isNotFoundError(classQuery.error)) {
      if (activeClassesQuery.isLoading) {
        return (
          <div className="h-[60vh] flex items-center justify-center flex-col gap-2">
            <Spinner size="large" />
            <p className="text-sm text-gray-600">Trying to reconnect you to an active live class...</p>
          </div>
        );
      }

      return (
        <div className="max-w-3xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-900">Class link is no longer active</h1>
          <p className="text-gray-600 mt-2">
            This class may have ended or the server was restarted. Ask the tutor to start a new offline class and share a fresh link.
          </p>
          {activeClassesQuery.data?.[0]?.id && authUser?.role && (
            <button
              onClick={() =>
                navigate(`/${authUser.role}/live-class/${activeClassesQuery.data[0].id}`)
              }
              className="mt-4 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Join Current Active Class
            </button>
          )}
        </div>
      );
    }
    return <ErrorAlert error={classQuery.error} />;
  }

  if (!liveClass?.isActive) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900">Class has ended</h1>
        <p className="text-gray-600 mt-2">
          This offline class is no longer active.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{liveClass.title}</h1>
          <p className="text-sm text-gray-600">
            Hosted by {liveClass.tutorName} • Offline shared class
          </p>
        </div>

        {isTutorHost && (
          <div className="flex gap-2">
            <button
              onClick={() => handleStartBroadcast({ showStartToast: true })}
              disabled={isBroadcasting}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              {isBroadcasting ? "Broadcasting..." : "Start Camera Broadcast"}
            </button>
            {isBroadcasting && (
              <button
                onClick={handleStopBroadcast}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600"
              >
                Stop Camera
              </button>
            )}
            <button
              onClick={() => endClassMutation.mutate()}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
              disabled={endClassMutation.isPending}
            >
              End Class
            </button>
          </div>
        )}

        {!isTutorHost && (
          <div className="flex gap-2">
            <button
              onClick={() => handleStartBroadcast({ showStartToast: true })}
              disabled={isBroadcasting}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              {isBroadcasting ? "Sharing..." : "Share My Camera"}
            </button>
            {isBroadcasting && (
              <button
                onClick={handleStopBroadcast}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600"
              >
                Stop Sharing
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {isTutorHost ? "Tutor Camera" : "Your Camera"}
          </p>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-[280px] bg-black rounded-lg object-cover"
          />
          <p className="text-xs text-gray-500 mt-2">
            {isTutorHost
              ? "Tutors publish snapshots every second so everyone can watch even when live WS services are unavailable."
              : "Students can share snapshots every second so tutors can see them even when live WS services are unavailable."}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {isTutorHost
              ? (participantFrameQuery.data?.participantName
                  ? `${participantFrameQuery.data.participantName} Camera`
                  : "Student View")
              : "Audience View"}
          </p>
          {(isTutorHost
            ? participantFrameQuery.data?.frameDataUrl
            : frameQuery.data?.frameDataUrl) ? (
            <div className="relative">
              <img
                src={
                  isTutorHost
                    ? participantFrameQuery.data?.frameDataUrl
                    : frameQuery.data?.frameDataUrl
                }
                alt={isTutorHost ? "Student camera stream" : "Offline class stream"}
                className="w-full h-[280px] bg-black rounded-lg object-cover"
              />
              <span
                className={`absolute top-2 right-2 rounded-full px-2 py-1 text-[11px] font-semibold ${
                  (isTutorHost ? isParticipantFrameStale : isFrameStale)
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {(isTutorHost ? isParticipantFrameStale : isFrameStale)
                  ? "Reconnecting..."
                  : "Live"}
              </span>
            </div>
          ) : (
            <div className="w-full h-[280px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm text-center px-4">
              {isTutorHost
                ? "Waiting for a student to share camera..."
                : "Waiting for tutor camera broadcast to start..."}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {isTutorHost
              ? "This panel auto-refreshes from the latest student snapshots."
              : "This panel auto-refreshes for all participants who join this class link."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineLiveClassPage;
