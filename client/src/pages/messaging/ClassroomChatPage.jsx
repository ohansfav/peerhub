import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ChatLoader from "../../components/ui/ChatLoader";
import ErrorAlert from "../../components/common/ErrorAlert";
import { useAuth } from "../../hooks/useAuthContext";
import { createBroadcastMessage } from "../../lib/api/broadcast/broadcastApi";
import {
  deleteOfflineClassRecording,
  getOfflineClassById,
  getOfflineClassChatState,
  getOfflineClassRecordings,
  heartbeatOfflineClassChatPresence,
  renameOfflineClassRecording,
  sendOfflineClassChatMessage,
  uploadOfflineClassRecording,
  updateOfflineClassChatSettings,
} from "../../lib/api/common/offlineClassApi";

const PRESENCE_HEARTBEAT_MS = 5000;
const ALERT_COOLDOWN_MS = 60_000;
const MAX_IMAGE_DATA_URL_LENGTH = 4_500_000;
const MAX_IMAGE_SIDE_PX = 900;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image"));
    };

    image.src = objectUrl;
  });

const compressImageFileToDataUrl = async (file) => {
  const image = await loadImageFromFile(file);

  const scale = Math.min(1, MAX_IMAGE_SIDE_PX / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas unavailable");
  }

  ctx.drawImage(image, 0, 0, width, height);

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH && quality > 0.32) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw new Error("Image too large");
  }

  return dataUrl;
};

const getAudioExtensionFromDataUrl = (dataUrl) => {
  const match = /^data:audio\/([^;]+);/i.exec(String(dataUrl || ""));
  if (!match?.[1]) return "webm";
  const subtype = match[1].toLowerCase();
  if (subtype.includes("mpeg")) return "mp3";
  if (subtype.includes("wav")) return "wav";
  if (subtype.includes("ogg")) return "ogg";
  if (subtype.includes("aac")) return "aac";
  return "webm";
};

const getInitials = (firstName, lastName) => {
  const f = String(firstName || "").trim().charAt(0);
  const l = String(lastName || "").trim().charAt(0);
  return `${f}${l}`.toUpperCase() || "U";
};

const formatDuration = (seconds) => {
  const total = Number(seconds || 0);
  if (!total) return null;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const getAuthUserRole = (authUser) =>
  String(authUser?.role || authUser?.user?.role || "").toLowerCase();

const getAuthUserId = (authUser) => String(authUser?.id || authUser?.user?.id || "");

const ClassroomChatPage = () => {
  const { id: classId } = useParams();
  const { authUser } = useAuth();
  const queryClient = useQueryClient();

  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [offlineText, setOfflineText] = useState("");
  const [offlineImageDataUrl, setOfflineImageDataUrl] = useState("");
  const [offlineAudioDataUrl, setOfflineAudioDataUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isClassRecording, setIsClassRecording] = useState(false);
  const [classRecordingStartedAt, setClassRecordingStartedAt] = useState(null);
  const [editingRecordingId, setEditingRecordingId] = useState(null);
  const [recordingTitleDraft, setRecordingTitleDraft] = useState("");
  const [alertCooldownRemainingMs, setAlertCooldownRemainingMs] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const classRecorderRef = useRef(null);
  const classRecordingStreamRef = useRef(null);
  const classRecordingChunksRef = useRef([]);
  const messagesContainerRef = useRef(null);

  const classQuery = useQuery({
    queryKey: ["offlineClass", classId, "chatMeta"],
    queryFn: () => getOfflineClassById(classId),
    enabled: Boolean(classId),
    staleTime: 1000 * 15,
  });

  const offlineStateQuery = useQuery({
    queryKey: ["offlineClassChatState", classId],
    queryFn: () => getOfflineClassChatState(classId),
    enabled: Boolean(classId),
    staleTime: 0,
    refetchInterval: 1200,
    refetchIntervalInBackground: false,
  });

  const recordingsQuery = useQuery({
    queryKey: ["offlineClassRecordings", classId],
    queryFn: () => getOfflineClassRecordings(classId),
    enabled: Boolean(classId),
    staleTime: 0,
    refetchInterval: 8000,
    refetchIntervalInBackground: false,
  });

  const currentUserRole = useMemo(() => getAuthUserRole(authUser), [authUser]);
  const currentUserId = useMemo(() => getAuthUserId(authUser), [authUser]);

  const isTutor = useMemo(
    () => Boolean(currentUserId) && currentUserId === String(classQuery.data?.tutorId || ""),
    [currentUserId, classQuery.data?.tutorId]
  );
  const canModerateClass = currentUserRole === "tutor" || currentUserRole === "admin";
  const canSendInSessionAlert = canModerateClass;

  const repliesLocked = Boolean(offlineStateQuery.data?.chatState?.repliesLocked);
  const announcementText = String(offlineStateQuery.data?.chatState?.pinnedAnnouncement || "");
  const onlineCount = Number(offlineStateQuery.data?.presence?.onlineCount || 0);
  const participantCount = Number(offlineStateQuery.data?.presence?.participants?.length || 0);
  const canReply = canModerateClass || !repliesLocked;
  const offlineMessages = offlineStateQuery.data?.messages || [];
  const classRecordings = recordingsQuery.data || offlineStateQuery.data?.recordings || [];

  const toggleRepliesMutation = useMutation({
    mutationFn: (nextLockedValue) =>
      updateOfflineClassChatSettings({
        classId,
        repliesLocked: nextLockedValue,
      }),
    onSuccess: async (nextLockedValue) => {
      await queryClient.invalidateQueries({ queryKey: ["offlineClassChatState", classId] });
      toast.success(nextLockedValue ? "Students are now muted." : "Students can reply now.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update class settings.");
    },
  });

  const announcementMutation = useMutation({
    mutationFn: (nextAnnouncement) =>
      updateOfflineClassChatSettings({
        classId,
        pinnedAnnouncement: nextAnnouncement,
      }),
    onSuccess: async (_, nextAnnouncement) => {
      setAnnouncementDraft("");
      await queryClient.invalidateQueries({ queryKey: ["offlineClassChatState", classId] });
      toast.success(nextAnnouncement ? "Announcement pinned." : "Announcement cleared.");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update announcement.");
    },
  });

  const sendOfflineMutation = useMutation({
    onMutate: async ({ text, imageDataUrl, audioDataUrl }) => {
      await queryClient.cancelQueries({ queryKey: ["offlineClassChatState", classId] });

      const previousState = queryClient.getQueryData(["offlineClassChatState", classId]);

      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage = {
        id: optimisticId,
        classId,
        senderId: currentUserId || authUser?.id,
        text: text || null,
        imageDataUrl: imageDataUrl || null,
        audioDataUrl: audioDataUrl || null,
        createdAt: new Date().toISOString(),
        sender: {
          id: currentUserId || authUser?.id,
          firstName: authUser?.firstName || authUser?.user?.firstName || "",
          lastName: authUser?.lastName || authUser?.user?.lastName || "",
          role: currentUserRole || null,
        },
      };

      queryClient.setQueryData(["offlineClassChatState", classId], (prev) => {
        if (!prev) return prev;
        const existingMessages = Array.isArray(prev.messages) ? prev.messages : [];
        return {
          ...prev,
          messages: [...existingMessages, optimisticMessage],
        };
      });

      return { previousState, optimisticId };
    },
    mutationFn: ({ text, imageDataUrl, audioDataUrl }) =>
      sendOfflineClassChatMessage({
        classId,
        text,
        imageDataUrl,
        audioDataUrl,
      }),
    onSuccess: async (createdMessage, _variables, context) => {
      setOfflineText("");
      setOfflineImageDataUrl("");
      setOfflineAudioDataUrl("");

      queryClient.setQueryData(["offlineClassChatState", classId], (prev) => {
        if (!prev || !createdMessage) return prev;

        const existingMessages = (Array.isArray(prev.messages) ? prev.messages : []).filter(
          (item) => String(item.id) !== String(context?.optimisticId)
        );
        const alreadyExists = existingMessages.some((item) => String(item.id) === String(createdMessage.id));
        if (alreadyExists) return prev;

        return {
          ...prev,
          messages: [...existingMessages, createdMessage],
        };
      });

      await queryClient.refetchQueries({ queryKey: ["offlineClassChatState", classId], type: "active" });
    },
    onError: (error, _variables, context) => {
      if (context?.previousState) {
        queryClient.setQueryData(["offlineClassChatState", classId], context.previousState);
      }
      toast.error(error?.response?.data?.message || error?.message || "Failed to send message.");
    },
  });

  const uploadClassRecordingMutation = useMutation({
    mutationFn: ({ audioDataUrl, mimeType, fileName, title, durationSeconds }) =>
      uploadOfflineClassRecording({
        classId,
        audioDataUrl,
        mimeType,
        fileName,
        title,
        durationSeconds,
      }),
    onSuccess: async () => {
      toast.success("Class recording saved.");
      await queryClient.invalidateQueries({ queryKey: ["offlineClassChatState", classId] });
      await queryClient.invalidateQueries({ queryKey: ["offlineClassRecordings", classId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to upload class recording.");
    },
  });

  const renameRecordingMutation = useMutation({
    mutationFn: ({ recordingId, title }) =>
      renameOfflineClassRecording({
        classId,
        recordingId,
        title,
      }),
    onSuccess: async () => {
      setEditingRecordingId(null);
      setRecordingTitleDraft("");
      toast.success("Recording title updated.");
      await queryClient.invalidateQueries({ queryKey: ["offlineClassRecordings", classId] });
      await queryClient.invalidateQueries({ queryKey: ["offlineClassChatState", classId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to rename recording.");
    },
  });

  const deleteRecordingMutation = useMutation({
    mutationFn: (recordingId) =>
      deleteOfflineClassRecording({
        classId,
        recordingId,
      }),
    onSuccess: async () => {
      toast.success("Recording deleted.");
      await queryClient.invalidateQueries({ queryKey: ["offlineClassRecordings", classId] });
      await queryClient.invalidateQueries({ queryKey: ["offlineClassChatState", classId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete recording.");
    },
  });

  const inSessionAlertMutation = useMutation({
    mutationFn: async () => {
      const classTitle = classQuery.data?.title || "session";
      const alertText = `Classroom ${classTitle} is currently in session. Join now with class ID ${classId}.`;

      await createBroadcastMessage({
        title: "Class is in session",
        message: alertText,
        targetRole: null,
      });

      const followUps = [];

      // Only class owner can patch chat settings.
      if (isTutor) {
        followUps.push(
          updateOfflineClassChatSettings({
            classId,
            pinnedAnnouncement: alertText,
          })
        );
      }

      // Timeline alert is best-effort so broadcast never fails because of chat permissions.
      followUps.push(
        sendOfflineClassChatMessage({
          classId,
          text: `🔔 ${alertText}`,
        })
      );

      await Promise.allSettled(followUps);

      return true;
    },
    onSuccess: async () => {
      toast.success("Class in-session alert sent to everyone.");
      setAlertCooldownRemainingMs(ALERT_COOLDOWN_MS);
      await queryClient.invalidateQueries({ queryKey: ["offlineClassChatState", classId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to send in-session alert.");
    },
  });

  useEffect(() => {
    if (alertCooldownRemainingMs <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setAlertCooldownRemainingMs((prev) => {
        if (prev <= 1000) {
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [alertCooldownRemainingMs]);

  useEffect(() => {
    if (!classId) return;

    let cancelled = false;

    const beat = async () => {
      try {
        await heartbeatOfflineClassChatPresence(classId);
        if (!cancelled) {
          await queryClient.invalidateQueries({ queryKey: ["offlineClassChatState", classId] });
        }
      } catch {
        // Keep polling resilient.
      }
    };

    beat();
    const timer = window.setInterval(beat, PRESENCE_HEARTBEAT_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [classId, queryClient]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [offlineMessages.length]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (classRecorderRef.current && classRecorderRef.current.state === "recording") {
        classRecorderRef.current.stop();
      }
      if (classRecordingStreamRef.current) {
        classRecordingStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  if (classQuery.isError) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-0">
        <ErrorAlert error={classQuery.error} />
      </div>
    );
  }

  if (classQuery.isLoading || offlineStateQuery.isLoading) {
    return <ChatLoader />;
  }

  if (offlineStateQuery.isError) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-0">
        <ErrorAlert error={offlineStateQuery.error} />
      </div>
    );
  }

  const submitOfflineMessage = (event) => {
    event.preventDefault();
    const text = String(offlineText || "").trim();
    if (!text && !offlineImageDataUrl && !offlineAudioDataUrl) {
      return;
    }

    sendOfflineMutation.mutate({
      text,
      imageDataUrl: offlineImageDataUrl || undefined,
      audioDataUrl: offlineAudioDataUrl || undefined,
    });
  };

  const startRecording = async () => {
    if (isRecording) return;

    if (!window.MediaRecorder || !navigator?.mediaDevices?.getUserMedia) {
      toast.error("Audio recording is not supported on this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          mediaChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(mediaChunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          if (blob.size > 5 * 1024 * 1024) {
            toast.error("Recorded audio is too large. Please keep recordings shorter.");
            return;
          }

          const dataUrl = await blobToDataUrl(blob);
          setOfflineAudioDataUrl(dataUrl);
          setOfflineImageDataUrl("");
        } catch {
          toast.error("Could not process recorded audio.");
        } finally {
          setIsRecording(false);
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
          }
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Microphone access denied or unavailable.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
      return;
    }
    mediaRecorderRef.current.stop();
  };

  const startClassRecording = async () => {
    if (!isTutor || isClassRecording) return;

    if (!window.MediaRecorder || !navigator?.mediaDevices?.getUserMedia) {
      toast.error("Class recording is not supported on this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      classRecordingStreamRef.current = stream;
      classRecordingChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      classRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          classRecordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(classRecordingChunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });

          if (blob.size > 26 * 1024 * 1024) {
            toast.error("Class recording is too large. Record a shorter segment and save again.");
            return;
          }

          const dataUrl = await blobToDataUrl(blob);
          const startedAt = classRecordingStartedAt || Date.now();
          const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
          const stamp = new Date().toLocaleString();
          const timestampSlug = new Date().toISOString().replace(/[:.]/g, "-");

          await uploadClassRecordingMutation.mutateAsync({
            audioDataUrl: dataUrl,
            mimeType: recorder.mimeType || blob.type || "audio/webm",
            fileName: `class-recording-${timestampSlug}`,
            title: `Class Session ${stamp}`,
            durationSeconds,
          });
        } catch {
          toast.error("Could not process class recording.");
        } finally {
          setIsClassRecording(false);
          setClassRecordingStartedAt(null);
          if (classRecordingStreamRef.current) {
            classRecordingStreamRef.current.getTracks().forEach((track) => track.stop());
            classRecordingStreamRef.current = null;
          }
        }
      };

      recorder.start(1000);
      setClassRecordingStartedAt(Date.now());
      setIsClassRecording(true);
      toast.success("Class recording started.");
    } catch {
      toast.error("Microphone access denied or unavailable for class recording.");
      setIsClassRecording(false);
      setClassRecordingStartedAt(null);
    }
  };

  const stopClassRecording = () => {
    if (!classRecorderRef.current || classRecorderRef.current.state !== "recording") {
      return;
    }
    classRecorderRef.current.stop();
  };

  const openRenameRecording = (recording) => {
    setEditingRecordingId(recording.id);
    setRecordingTitleDraft(recording.title || recording.fileName || "");
  };

  const saveRenameRecording = () => {
    const nextTitle = String(recordingTitleDraft || "").trim();
    if (!nextTitle) {
      toast.error("Please enter a recording title.");
      return;
    }

    renameRecordingMutation.mutate({
      recordingId: editingRecordingId,
      title: nextTitle,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-0">
      <div className="sticky top-0 z-30 pb-3 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-5 mb-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{classQuery.data?.title || "Classroom Chat"}</h1>
            <p className="text-sm text-slate-600 mt-1">
              {repliesLocked ? "Tutor-only teaching mode is active" : "Open discussion mode is active"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-700">
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 font-medium">
                {onlineCount} online
              </span>
              <span className="rounded-full bg-sky-100 border border-sky-300 px-3 py-1 font-medium">
                {participantCount} participants
              </span>
              {isClassRecording && (
                <span className="rounded-full bg-rose-100 border border-rose-300 px-3 py-1 font-medium text-rose-700">
                  Recording in progress
                </span>
              )}
            </div>
          </div>

          {(canModerateClass || canSendInSessionAlert) && (
            <div className="flex flex-wrap gap-2">
              {canSendInSessionAlert && (
                <button
                  type="button"
                  onClick={() => inSessionAlertMutation.mutate()}
                  disabled={inSessionAlertMutation.isPending || alertCooldownRemainingMs > 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm disabled:opacity-60"
                >
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/20 text-white text-base leading-none shadow-inner">
                    🔔
                  </span>
                  {inSessionAlertMutation.isPending
                    ? "Alerting..."
                    : alertCooldownRemainingMs > 0
                      ? `Alert Again in ${Math.ceil(alertCooldownRemainingMs / 1000)}s`
                      : "Alert Everyone: In Session"}
                </button>
              )}

              {canModerateClass && (
                <>
                  <button
                    type="button"
                    onClick={() => toggleRepliesMutation.mutate(!repliesLocked)}
                    disabled={toggleRepliesMutation.isPending}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm ${
                      repliesLocked ? "bg-indigo-600 hover:bg-indigo-700" : "bg-amber-500 hover:bg-amber-600"
                    } disabled:opacity-60`}
                  >
                    {repliesLocked ? "Unlock Replies" : "Lock Replies"}
                  </button>
                  {isClassRecording ? (
                    <button
                      type="button"
                      onClick={stopClassRecording}
                      disabled={uploadClassRecordingMutation.isPending}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm disabled:opacity-60"
                    >
                      {uploadClassRecordingMutation.isPending ? "Saving..." : "Stop & Save Recording"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startClassRecording}
                      disabled={uploadClassRecordingMutation.isPending}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-60"
                    >
                      Start Class Recording
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {recordingsQuery.isError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not refresh class recordings right now.
        </div>
      )}

      {!canReply && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Tutor locked the class chat for teaching. You can read messages until replies are unlocked.
        </div>
      )}

      {announcementText && (
        <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-900">
          <span className="font-semibold">Pinned Announcement:</span> {announcementText}
        </div>
      )}

      {isTutor && (
        <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-2">Tutor Announcement</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={announcementDraft}
              onChange={(e) => setAnnouncementDraft(e.target.value)}
              placeholder="Write a short class announcement"
              className="flex-1 min-w-[220px] border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={announcementMutation.isPending || !announcementDraft.trim()}
              onClick={() => announcementMutation.mutate(announcementDraft.trim())}
              className="px-3 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Pin
            </button>
            <button
              type="button"
              disabled={announcementMutation.isPending || !announcementText}
              onClick={() => announcementMutation.mutate("")}
              className="px-3 py-2 rounded-md text-sm font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-[calc(100vh-17rem)] min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="relative flex-1 overflow-hidden bg-slate-50">
            <div
              className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl"
              style={{ transform: `translateY(${parallaxOffset * 0.12}px)` }}
            />
            <div
              className="pointer-events-none absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl"
              style={{ transform: `translateY(${-parallaxOffset * 0.08}px)` }}
            />

            <div
              ref={messagesContainerRef}
              onScroll={(event) => setParallaxOffset(event.currentTarget.scrollTop)}
              className="relative z-10 h-full overflow-y-auto p-4 space-y-3"
            >
              {offlineMessages.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No messages yet. Say hello to your class.</div>
              ) : (
                offlineMessages.map((msg) => {
                  const mine = String(msg.senderId || "") === String(currentUserId || "");
                  const firstName = msg?.sender?.firstName || "";
                  const lastName = msg?.sender?.lastName || "";
                  const senderName = `${firstName} ${lastName}`.trim() || "User";

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                    >
                      {!mine && (
                        <div className="h-8 w-8 rounded-full bg-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0">
                          {getInitials(firstName, lastName)}
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          mine
                            ? "bg-sky-600 text-white rounded-br-md"
                            : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                        }`}
                        style={
                          mine
                            ? {
                                backgroundColor: "#0284c7",
                                color: "#ffffff",
                              }
                            : {
                                backgroundColor: "#ffffff",
                                color: "#1f2937",
                                borderColor: "#e2e8f0",
                                borderWidth: "1px",
                                borderStyle: "solid",
                              }
                        }
                      >
                        {!mine && <p className="text-[11px] font-semibold mb-1 opacity-80">{senderName}</p>}
                        {msg.text ? <p className="leading-relaxed">{msg.text}</p> : null}
                        {msg.imageDataUrl ? (
                          <img
                            src={msg.imageDataUrl}
                            alt="Class message"
                            className="mt-2 rounded-lg max-h-56 max-w-full object-contain border border-slate-200 bg-slate-100"
                          />
                        ) : null}
                        {msg.audioDataUrl ? (
                          <div className="mt-2 space-y-1">
                            <audio controls src={msg.audioDataUrl} className="w-full max-w-xs" />
                            <a
                              href={msg.audioDataUrl}
                              download={`class-audio-${msg.id}.${getAudioExtensionFromDataUrl(msg.audioDataUrl)}`}
                              className={`inline-block text-xs underline ${mine ? "text-cyan-100" : "text-sky-700"}`}
                            >
                              Download recording
                            </a>
                          </div>
                        ) : null}
                        <p className={`text-[10px] mt-1 ${mine ? "text-cyan-100" : "text-slate-500"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {canReply ? (
            <form onSubmit={submitOfflineMessage} className="border-t border-slate-200 p-3 bg-white space-y-2">
              {offlineImageDataUrl ? (
                <div className="relative inline-block">
                  <img src={offlineImageDataUrl} alt="Preview" className="h-20 w-20 rounded-md object-cover border" />
                  <button
                    type="button"
                    onClick={() => setOfflineImageDataUrl("")}
                    className="absolute -top-2 -right-2 rounded-full bg-rose-600 text-white text-[10px] px-1.5 py-0.5"
                  >
                    x
                  </button>
                </div>
              ) : null}

              {offlineAudioDataUrl ? (
                <div className="relative rounded-md border border-slate-200 p-2 max-w-md">
                  <audio controls src={offlineAudioDataUrl} className="w-full" />
                  <button
                    type="button"
                    onClick={() => setOfflineAudioDataUrl("")}
                    className="absolute -top-2 -right-2 rounded-full bg-rose-600 text-white text-[10px] px-1.5 py-0.5"
                  >
                    x
                  </button>
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <input
                  value={offlineText}
                  onChange={(e) => setOfflineText(e.target.value)}
                  placeholder="Type a message for the class"
                  className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
                <label className="px-3 py-2 rounded-md border border-slate-300 text-sm cursor-pointer hover:bg-slate-50">
                  Image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 9 * 1024 * 1024) {
                        toast.error("Image is too large. Please choose an image under 9MB.");
                        return;
                      }

                      try {
                        const dataUrl = await compressImageFileToDataUrl(file);
                        setOfflineImageDataUrl(dataUrl);
                        setOfflineAudioDataUrl("");
                      } catch {
                        try {
                          const fallbackDataUrl = await fileToDataUrl(file);
                          if (fallbackDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
                            toast.error("Image is still too large after processing. Try a smaller image.");
                            return;
                          }
                          setOfflineImageDataUrl(fallbackDataUrl);
                          setOfflineAudioDataUrl("");
                        } catch {
                          toast.error("Could not read image file.");
                        }
                      }
                    }}
                  />
                </label>
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-3 py-2 rounded-md text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-3 py-2 rounded-md border border-slate-300 text-sm hover:bg-slate-50"
                  >
                    Voice
                  </button>
                )}
                <button
                  type="submit"
                  disabled={sendOfflineMutation.isPending}
                  className="px-4 py-2 rounded-md bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500 bg-slate-50">
              Replies are temporarily locked by tutor.
            </div>
          )}
        </div>

        <div className="h-[calc(100vh-17rem)] min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-800">Class Recordings</p>
            <p className="text-xs text-slate-500 mt-1">Saved sessions can be replayed or downloaded later.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {classRecordings.length === 0 ? (
              <p className="text-sm text-slate-500">No saved recordings yet.</p>
            ) : (
              classRecordings.map((recording) => {
                const tutorName = recording?.tutor
                  ? `${recording.tutor.firstName || ""} ${recording.tutor.lastName || ""}`.trim() || "Tutor"
                  : "Tutor";
                const fileLabel = recording.fileName || `class-recording-${recording.id}`;
                const durationText = formatDuration(recording.durationSeconds);
                const isEditing = editingRecordingId === recording.id;

                return (
                  <div key={recording.id} className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <input
                              value={recordingTitleDraft}
                              onChange={(e) => setRecordingTitleDraft(e.target.value)}
                              placeholder="Recording title"
                              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs"
                            />
                            <button
                              type="button"
                              onClick={saveRenameRecording}
                              disabled={renameRecordingMutation.isPending}
                              className="px-2 py-1 rounded-md bg-emerald-600 text-white text-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRecordingId(null);
                                setRecordingTitleDraft("");
                              }}
                              className="px-2 py-1 rounded-md bg-slate-200 text-slate-800 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {recording.title || fileLabel}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500 mt-1">
                          {tutorName}
                          {durationText ? ` • ${durationText}` : ""}
                          {recording.createdAt ? ` • ${new Date(recording.createdAt).toLocaleString()}` : ""}
                        </p>
                      </div>
                      <a
                        href={recording.audioDataUrl}
                        download={fileLabel}
                        className="text-xs underline text-sky-700 shrink-0"
                      >
                        Download
                      </a>
                    </div>

                    <audio controls src={recording.audioDataUrl} className="w-full" />

                    {isTutor && (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openRenameRecording(recording)}
                          className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs hover:bg-slate-200"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRecordingMutation.mutate(recording.id)}
                          disabled={deleteRecordingMutation.isPending}
                          className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-xs hover:bg-rose-100 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomChatPage;
