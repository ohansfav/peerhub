import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  StreamVideo,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import "./stream.css";
import PageLoader, {
  PageLoaderMessage,
} from "../../components/common/PageLoader";
import FeedbackModal from "../../components/messaging/FeedbackModal";
import { handleToastError, handleToastSuccess } from "../../utils/toastDisplayHandler";
import { fetchBookingById } from "../../lib/api/common/bookingApi";
import { useAuth } from "../../hooks/useAuthContext";
import useCreateReview from "../../hooks/review/useCreateReview";
import useCallAccess from "../../hooks/booking/useCallAccess";
import {
  trackSessionCompleted,
  trackSessionStart,
} from "../../lib/api/analytics/trackEventApi";
import { useStreamContext } from "../../hooks/messaging/useStreamContext";
import { createBroadcastMessage } from "../../lib/api/broadcast/broadcastApi";

const CallPage = () => {
  const { id: bookingId } = useParams();
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { videoClient, isReady, isInitializing, streamError } = useStreamContext();

  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: bookingData, isLoading: isBookingLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => fetchBookingById(bookingId),
    enabled: !!bookingId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { canAccess, reason, dashboardLink } = useCallAccess(bookingData);

  useEffect(() => {
    if (!isReady || !videoClient || !authUser || !bookingId || !canAccess)
      return;

    const callInstance = videoClient.call("default", bookingId);
    let joined = false;

    const joinCall = async () => {
      try {
        setIsConnecting(true);
        // Tutor starts class with camera on by default; others can still join muted/video-off.
        if (authUser.role !== "tutor") {
          await callInstance.camera.disable();
        }
        // await callInstance.microphone.disable();

        await callInstance.join({
          create: true,
        });
        joined = true;

        await trackSessionStart({
          sessionId: callInstance.id,
          studentId: authUser.role === "student" ? authUser.id : null,
          tutorId: authUser.role === "tutor" ? authUser.id : null,
        });

        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        handleToastError(error, "Could not join the call.");
      } finally {
        setIsConnecting(false);
      }
    };

    joinCall();

    return () => {
      (async () => {
        try {
          if (
            joined &&
            callInstance.state?.callingState !== CallingState.LEFT
          ) {
            await callInstance.leave();
          }
        } catch (err) {
          if (!err.message?.includes("already been left")) {
            console.error("Cleanup error on unmount:", err);
          }
        }
      })();
    };
  }, [isReady, videoClient, authUser, bookingId, canAccess]);

  if (isBookingLoading || isInitializing || isConnecting) return <PageLoader />;

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-lg text-gray-800 mb-6 text-center">{reason}</p>
        <Link
          to={dashboardLink}
          className="bg-primary text-white px-6 py-3 rounded-full font-semibold transition-colors hover:bg-primary-focus"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (streamError) {
    return (
      <OfflineClassRoom
        authUser={authUser}
        bookingData={bookingData}
        dashboardLink={dashboardLink}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      {videoClient && call && bookingData ? (
        <StreamVideo client={videoClient}>
          <StreamTheme theme="light">
            <StreamCall call={call}>
              <CallContent
                call={call}
                authUser={authUser}
                navigate={navigate}
                bookingData={bookingData}
                queryClient={queryClient}
              />
            </StreamCall>
          </StreamTheme>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Could not initialize call. Please refresh or try again later.</p>
        </div>
      )}
    </div>
  );
};

const OfflineClassRoom = ({ authUser, bookingData, dashboardLink }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const classAlertMutation = useMutation({
    mutationFn: createBroadcastMessage,
    onSuccess: () => {
      handleToastSuccess("Class alert sent successfully");
    },
    onError: (error) => {
      handleToastError(error, "Failed to send class alert");
    },
  });

  const startCamera = async () => {
    try {
      if (streamRef.current) return;
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      handleToastError(error, "Could not start camera/microphone");
    }
  };

  const stopCamera = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const sendClassAlert = (type) => {
    const tutorName = `${authUser?.firstName || "Tutor"} ${authUser?.lastName || ""}`.trim();
    const subjectName = bookingData?.subject?.name || "class";

    const payload =
      type === "starting"
        ? {
            title: "Class is starting now",
            message: `${tutorName} has started the ${subjectName} virtual class. Join now if you are attending.`,
          }
        : {
            title: "Class already in progress",
            message: `${tutorName}'s ${subjectName} virtual class is currently in progress. Join now to catch up live.`,
          };

    classAlertMutation.mutate(payload);
  };

  const isTutor = authUser?.role === "tutor";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow border p-4 sm:p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Offline Virtual Class Mode</h2>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          Live network call is unavailable right now. You can still start your camera locally and send class alerts.
        </p>

        <div className="rounded-lg overflow-hidden border bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[60vh] object-cover" />
        </div>

        {isTutor ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn bg-primary text-white hover:bg-primary-focus" onClick={startCamera}>
              Start Camera
            </button>
            <button type="button" className="btn btn-outline" onClick={stopCamera}>
              Stop Camera
            </button>
            <button
              type="button"
              className="btn btn-sm bg-primary text-white hover:bg-primary-focus"
              onClick={() => sendClassAlert("starting")}
              disabled={classAlertMutation.isPending}
            >
              Alert Everyone: Class Starting
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => sendClassAlert("ongoing")}
              disabled={classAlertMutation.isPending}
            >
              Alert Everyone: Class Ongoing
            </button>
          </div>
        ) : (
          <p className="text-gray-600">Your tutor may be running in offline mode. Watch for class alerts in notifications.</p>
        )}

        <Link
          to={dashboardLink}
          className="inline-flex px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

const CallContent = ({
  call,
  authUser,
  navigate,
  bookingData,
  queryClient,
}) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { createReviewMutation, isCreatingReview } = useCreateReview();
  const classAlertMutation = useMutation({
    mutationFn: createBroadcastMessage,
    onSuccess: () => {
      handleToastSuccess("Class alert sent successfully");
    },
    onError: (error) => {
      handleToastError(error, "Failed to send class alert");
    },
  });

  const storedReviewee =
    authUser.role === "student"
      ? bookingData?.tutor?.user
      : bookingData?.student?.user;

  const handleNavigate = () => {
    navigate(authUser.role === "student" ? "/student" : "/tutor");
  };

  const handleCloseModal = () => {
    setShowFeedbackModal(false);
    handleNavigate();
  };

  const handleSubmitFeedback = (feedback) => {
    if (!storedReviewee) {
      console.warn("No reviewee found, skipping review");
      handleCloseModal();
      return;
    }

    createReviewMutation(
      {
        ...feedback,
        revieweeId: storedReviewee?.id,
        sessionId: call.id,
        type:
          authUser.role === "student" ? "student_to_tutor" : "tutor_to_student",
      },
      { onSettled: handleCloseModal }
    );
  };

  const sendClassAlert = (type) => {
    const tutorName = `${authUser?.firstName || "Tutor"} ${authUser?.lastName || ""}`.trim();
    const subjectName = bookingData?.subject?.name || "class";

    const payload =
      type === "starting"
        ? {
            title: "Class is starting now",
            message: `${tutorName} has started the ${subjectName} virtual class. Join now if you are attending.`,
          }
        : {
            title: "Class already in progress",
            message: `${tutorName}'s ${subjectName} virtual class is currently in progress. Join now to catch up live.`,
          };

    classAlertMutation.mutate(payload);
  };

  // ✅ Track when call starts
  useEffect(() => {
    if (callingState === CallingState.JOINED && !startTimeRef.current) {
      startTimeRef.current = new Date();
    }
  }, [callingState]);

  // ✅ Track when call ends and show feedback modal
  useEffect(() => {
    const handleDisconnect = async () => {
      setIsDisconnecting(true);

      const now = new Date();
      const durationMs = now - startTimeRef.current;
      const minDurationMs = 10 * 1000; // 10 seconds minimum

      if (durationMs < minDurationMs) {
        console.log("Skipping completion – call too short (<10s)");
        setIsDisconnecting(false);
        setShowFeedbackModal(true);
        return;
      }

      try {
        await trackSessionCompleted({
          sessionId: call.id,
          studentId: authUser.role === "student" ? authUser.id : null,
          tutorId: authUser.role === "tutor" ? authUser.id : null,
          startedAt: startTimeRef.current,
        });

        // Optional: give backend a second to settle
        await new Promise((res) => setTimeout(res, 1000));

        console.log("Session completed successfully");
      } catch (err) {
        console.error("Failed to track session completion:", err);
      }

      setIsDisconnecting(false);
      setShowFeedbackModal(true);
    };

    if (callingState === CallingState.LEAVING) {
      // Immediately show loader
      setIsDisconnecting(true);
    }

    if (
      callingState === CallingState.LEFT &&
      startTimeRef.current &&
      !completedRef.current
    ) {
      completedRef.current = true;
      handleDisconnect();
    }
  }, [callingState, authUser, call, queryClient]);

  return (
    <StreamTheme theme="light">
      {isDisconnecting && (
        <PageLoaderMessage message="Disconnecting from call..." />
      )}

      <SpeakerLayout />
      {authUser.role === "tutor" && (
        <div className="px-4 pb-2 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="btn btn-sm bg-primary text-white hover:bg-primary-focus"
            onClick={() => sendClassAlert("starting")}
            disabled={classAlertMutation.isPending}
          >
            Alert Everyone: Class Starting
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => sendClassAlert("ongoing")}
            disabled={classAlertMutation.isPending}
          >
            Alert Everyone: Class Ongoing
          </button>
        </div>
      )}
      <CallControls
        onLeave={async () => {
          try {
            await call.leave();
          } catch (err) {
            if (!err.message?.includes("already been left")) {
              console.error("Call leave error:", err);
            }
          }
        }}
      />
      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={handleCloseModal}
          onSubmit={handleSubmitFeedback}
          revieweeName={storedReviewee?.name ?? "the other participant"}
          isSubmitting={isCreatingReview}
        />
      )}
    </StreamTheme>
  );
};

export default CallPage;
