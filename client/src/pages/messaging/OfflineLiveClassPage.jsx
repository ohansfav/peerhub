import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useAuth } from "../../hooks/useAuthContext";
import {
  endOfflineClass,
  getOfflineClassById,
  getOfflineClassFrame,
  updateOfflineClassFrame,
} from "../../lib/api/common/offlineClassApi";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";

const CAPTURE_INTERVAL_MS = 1200;

const OfflineLiveClassPage = () => {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

  const classQuery = useQuery({
    queryKey: ["offlineClass", classId],
    queryFn: () => getOfflineClassById(classId),
    refetchInterval: 5000,
    enabled: Boolean(classId),
  });

  const frameQuery = useQuery({
    queryKey: ["offlineClassFrame", classId],
    queryFn: () => getOfflineClassFrame(classId),
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
    enabled: Boolean(classId),
  });

  const uploadFrameMutation = useMutation({
    mutationFn: ({ frameDataUrl }) =>
      updateOfflineClassFrame({ classId, frameDataUrl }),
    onError: (error) => {
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
    () => Boolean(liveClass?.tutorId && authUser?.id === liveClass.tutorId),
    [liveClass?.tutorId, authUser?.id],
  );

  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartBroadcast = async () => {
    try {
      if (!isTutorHost) return;
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

      captureIntervalRef.current = window.setInterval(() => {
        const videoEl = videoRef.current;
        if (!videoEl || videoEl.readyState < 2) return;

        const canvas = canvasRef.current;
        canvas.width = 640;
        canvas.height = 360;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const frameDataUrl = canvas.toDataURL("image/jpeg", 0.65);

        uploadFrameMutation.mutate({ frameDataUrl });
      }, CAPTURE_INTERVAL_MS);

      handleToastSuccess("Offline class broadcast is live.");
    } catch (error) {
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
              onClick={handleStartBroadcast}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Start Camera Broadcast
            </button>
            <button
              onClick={() => endClassMutation.mutate()}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
              disabled={endClassMutation.isPending}
            >
              End Class
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">Tutor Camera</p>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-[280px] bg-black rounded-lg object-cover"
          />
          <p className="text-xs text-gray-500 mt-2">
            Tutors publish snapshots every second so everyone can watch even when live WS services are unavailable.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">Audience View</p>
          {frameQuery.data?.frameDataUrl ? (
            <img
              src={frameQuery.data.frameDataUrl}
              alt="Offline class stream"
              className="w-full h-[280px] bg-black rounded-lg object-cover"
            />
          ) : (
            <div className="w-full h-[280px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm text-center px-4">
              Waiting for tutor camera broadcast to start...
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            This panel auto-refreshes for all participants who join this class link.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineLiveClassPage;
