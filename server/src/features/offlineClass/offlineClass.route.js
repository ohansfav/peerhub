const express = require("express");
const { Op } = require("sequelize");
const {
  protectRoute,
  requireVerifiedAndOnboardedUser,
  requireTutorRole,
} = require("@features/auth/auth.middleware");
const {
  OfflineClass,
  OfflineClassChatMessage,
  OfflineClassChatState,
  OfflineClassPresence,
  OfflineClassRecording,
  User,
} = require("@models");
const sendResponse = require("@utils/sendResponse");
const ApiError = require("@utils/apiError");

const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedAndOnboardedUser);

const PRESENCE_TTL_MS = 30 * 1000;

const normalizeText = (value) => String(value || "").trim();

const normalizeParticipantUserIds = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => normalizeText(item)).filter(Boolean))];
};

const getClassParticipantUserIds = (liveClass) => {
  const fallback = normalizeText(liveClass?.participantUserId);
  const raw = normalizeText(liveClass?.participantUserIdsJson);

  if (!raw) {
    return fallback ? [fallback] : [];
  }

  try {
    const parsed = JSON.parse(raw);
    const ids = normalizeParticipantUserIds(parsed);
    if (ids.length > 0) {
      return ids;
    }
  } catch {
    // ignore parse failures and fallback below
  }

  return fallback ? [fallback] : [];
};

const areSameIds = (first, second) => {
  if (first.length !== second.length) {
    return false;
  }

  const normalizedFirst = [...first].sort();
  const normalizedSecond = [...second].sort();
  return normalizedFirst.every((value, index) => value === normalizedSecond[index]);
};

const isClassPrivate = (liveClass) => getClassParticipantUserIds(liveClass).length > 0;

const canAccessClass = (liveClass, user) => {
  if (!user) {
    return false;
  }

  if (String(liveClass.tutorId) === String(user.id)) {
    return true;
  }

  if (!isClassPrivate(liveClass)) {
    return true;
  }

  return getClassParticipantUserIds(liveClass).includes(String(user.id));
};

const ensureClass = async (classId, user) => {
  const liveClass = await OfflineClass.findByPk(classId);
  if (!liveClass) {
    throw new ApiError("Offline class not found", 404);
  }

  if (user && !canAccessClass(liveClass, user)) {
    throw new ApiError("You are not allowed to access this class", 403);
  }

  return liveClass;
};

const ensureChatState = async (classId) => {
  let state = await OfflineClassChatState.findOne({ where: { classId } });
  if (!state) {
    state = await OfflineClassChatState.create({
      classId,
      repliesLocked: false,
      pinnedAnnouncement: null,
    });
  }
  return state;
};

const cleanupPresence = async (classId) => {
  const cutoff = new Date(Date.now() - PRESENCE_TTL_MS);
  await OfflineClassPresence.destroy({
    where: {
      classId,
      lastSeenAt: { [Op.lt]: cutoff },
    },
  });
};

router.get("/active", async (req, res) => {
  const activeClasses = await OfflineClass.findAll({
    where: { isActive: true },
    order: [["startedAt", "DESC"]],
    attributes: [
      "id",
      "tutorId",
      "tutorName",
      "title",
      "startedAt",
      "lastFrameAt",
      "participantUserId",
      "participantUserIdsJson",
      "participantName",
    ],
  });

  const visibleClasses =
    req.user.role === "student"
      ? activeClasses.filter((liveClass) => canAccessClass(liveClass, req.user))
      : activeClasses;

  sendResponse(res, 200, "Active offline classes fetched", visibleClasses);
});

router.post("/start", requireTutorRole, async (req, res, next) => {
  try {
    const legacyParticipantUserId = normalizeText(req.body?.participantUserId);
    const requestedParticipantUserIds = normalizeParticipantUserIds(req.body?.participantUserIds);
    const participantUserIds = normalizeParticipantUserIds([
      ...requestedParticipantUserIds,
      ...(legacyParticipantUserId ? [legacyParticipantUserId] : []),
    ]);

    if (participantUserIds.length > 10) {
      throw new ApiError("Private class supports up to 10 students", 400);
    }

    let participantName = null;
    if (participantUserIds.length > 0) {
      const participantUsers = await User.findAll({
        where: {
          id: { [Op.in]: participantUserIds },
          role: "student",
        },
        attributes: ["id", "firstName", "lastName"],
      });

      const participantNames = participantUsers.map((participantUser) =>
        `${participantUser.firstName || "Student"} ${participantUser.lastName || ""}`.trim()
      );

      if (participantUsers.length !== participantUserIds.length) {
        throw new ApiError("Selected participants must be existing students", 400);
      }

      if (participantNames.length === 1) {
        participantName = participantNames[0];
      } else {
        participantName = `${participantNames.length} Students`;
      }
    }

    const existingActiveClasses = await OfflineClass.findAll({
      where: {
        isActive: true,
        tutorId: req.user.id,
      },
      order: [["startedAt", "DESC"]],
    });

    const existingActiveClass = existingActiveClasses.find((liveClass) =>
      areSameIds(getClassParticipantUserIds(liveClass), participantUserIds)
    );

    if (existingActiveClass) {
      return sendResponse(res, 200, "An offline class is already active", {
        createdNew: false,
        id: existingActiveClass.id,
        tutorId: existingActiveClass.tutorId,
        tutorName: existingActiveClass.tutorName,
        title: existingActiveClass.title,
        startedAt: existingActiveClass.startedAt,
        participantUserId: existingActiveClass.participantUserId,
        participantUserIds: getClassParticipantUserIds(existingActiveClass),
        participantName: existingActiveClass.participantName,
        isPrivate: isClassPrivate(existingActiveClass),
      });
    }

    const defaultTitle = participantUserIds.length > 0
      ? "Private Offline Class"
      : "Open Offline Class";
    const title = String(req.body?.title || defaultTitle).trim();

    const liveClass = await OfflineClass.create({
      tutorId: req.user.id,
      tutorName: `${req.user.firstName || "Tutor"} ${req.user.lastName || ""}`.trim(),
      title,
      isActive: true,
      startedAt: new Date(),
      endedAt: null,
      frameDataUrl: null,
      lastFrameAt: null,
      participantFrameDataUrl: null,
      participantLastFrameAt: null,
      participantUserId: participantUserIds.length === 1 ? participantUserIds[0] : null,
      participantUserIdsJson:
        participantUserIds.length > 0 ? JSON.stringify(participantUserIds) : null,
      participantName,
    });

    sendResponse(res, 201, "Offline class started", {
      createdNew: true,
      id: liveClass.id,
      tutorId: liveClass.tutorId,
      tutorName: liveClass.tutorName,
      title: liveClass.title,
      startedAt: liveClass.startedAt,
      participantUserId: liveClass.participantUserId,
      participantUserIds,
      participantName: liveClass.participantName,
      isPrivate: isClassPrivate(liveClass),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:classId", async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    sendResponse(res, 200, "Offline class fetched", {
      id: liveClass.id,
      tutorId: liveClass.tutorId,
      tutorName: liveClass.tutorName,
      title: liveClass.title,
      isActive: liveClass.isActive,
      startedAt: liveClass.startedAt,
      endedAt: liveClass.endedAt,
      lastFrameAt: liveClass.lastFrameAt,
      participantUserId: liveClass.participantUserId,
      participantUserIds: getClassParticipantUserIds(liveClass),
      participantName: liveClass.participantName,
      isPrivate: isClassPrivate(liveClass),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:classId/frame", requireTutorRole, async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (liveClass.tutorId !== req.user.id) {
      throw new ApiError("Only the class tutor can publish frames", 403);
    }

    if (!liveClass.isActive) {
      throw new ApiError("Class is no longer active", 400);
    }

    const frameDataUrl = String(req.body?.frameDataUrl || "");
    if (!frameDataUrl.startsWith("data:image/jpeg;base64,")) {
      throw new ApiError("Invalid frame payload", 400);
    }

    if (frameDataUrl.length > 2_000_000) {
      throw new ApiError("Frame payload too large", 413);
    }

    liveClass.frameDataUrl = frameDataUrl;
    liveClass.lastFrameAt = new Date();
    await liveClass.save();

    sendResponse(res, 200, "Frame updated", {
      classId: liveClass.id,
      lastFrameAt: liveClass.lastFrameAt,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:classId/participant-frame", async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (!liveClass.isActive) {
      throw new ApiError("Class is no longer active", 400);
    }

    if (String(liveClass.tutorId) === String(req.user.id)) {
      throw new ApiError("Tutor should publish using tutor frame endpoint", 400);
    }

    const frameDataUrl = String(req.body?.frameDataUrl || "");
    if (!frameDataUrl.startsWith("data:image/jpeg;base64,")) {
      throw new ApiError("Invalid frame payload", 400);
    }

    if (frameDataUrl.length > 2_000_000) {
      throw new ApiError("Frame payload too large", 413);
    }

    liveClass.participantFrameDataUrl = frameDataUrl;
    liveClass.participantLastFrameAt = new Date();
    liveClass.participantUserId = req.user.id;
    liveClass.participantName =
      `${req.user.firstName || "Student"} ${req.user.lastName || ""}`.trim();
    await liveClass.save();

    sendResponse(res, 200, "Participant frame updated", {
      classId: liveClass.id,
      lastFrameAt: liveClass.participantLastFrameAt,
      participantName: liveClass.participantName,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:classId/frame", async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (!liveClass.isActive) {
      throw new ApiError("Class has ended", 410);
    }

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    sendResponse(res, 200, "Frame fetched", {
      frameDataUrl: liveClass.frameDataUrl,
      lastFrameAt: liveClass.lastFrameAt,
      tutorName: liveClass.tutorName,
      title: liveClass.title,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:classId/participant-frame", async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (!liveClass.isActive) {
      throw new ApiError("Class has ended", 410);
    }

    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    sendResponse(res, 200, "Participant frame fetched", {
      frameDataUrl: liveClass.participantFrameDataUrl,
      lastFrameAt: liveClass.participantLastFrameAt,
      participantName: liveClass.participantName,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:classId/end", requireTutorRole, async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (liveClass.tutorId !== req.user.id) {
      throw new ApiError("Only the class tutor can end this class", 403);
    }

    liveClass.isActive = false;
    liveClass.endedAt = new Date();
    await liveClass.save();

    sendResponse(res, 200, "Offline class ended", {
      id: liveClass.id,
      endedAt: liveClass.endedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:classId/chat/state", async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);
    const state = await ensureChatState(liveClass.id);

    await cleanupPresence(liveClass.id);

    const messages = await OfflineClassChatMessage.findAll({
      where: { classId: liveClass.id },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "profileImageUrl", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: 250,
    });

    const presenceRows = await OfflineClassPresence.findAll({
      where: { classId: liveClass.id },
      order: [["lastSeenAt", "DESC"]],
      limit: 200,
    });

    const recordings = await OfflineClassRecording.findAll({
      where: { classId: liveClass.id },
      include: [
        {
          model: User,
          as: "tutor",
          attributes: ["id", "firstName", "lastName", "profileImageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 40,
    });

    sendResponse(res, 200, "Offline classroom chat state fetched", {
      classId: liveClass.id,
      classMeta: {
        title: liveClass.title,
        tutorId: liveClass.tutorId,
        tutorName: liveClass.tutorName,
        isActive: liveClass.isActive,
        participantUserId: liveClass.participantUserId,
        participantUserIds: getClassParticipantUserIds(liveClass),
        participantName: liveClass.participantName,
        isPrivate: isClassPrivate(liveClass),
      },
      chatState: {
        repliesLocked: Boolean(state.repliesLocked),
        pinnedAnnouncement: state.pinnedAnnouncement || "",
      },
      presence: {
        onlineCount: presenceRows.length,
        participants: presenceRows.map((item) => ({
          userId: item.userId,
          userName: item.userName,
          role: item.role,
          lastSeenAt: item.lastSeenAt,
        })),
      },
      messages,
      recordings,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:classId/chat/recordings", async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    const recordings = await OfflineClassRecording.findAll({
      where: { classId: liveClass.id },
      include: [
        {
          model: User,
          as: "tutor",
          attributes: ["id", "firstName", "lastName", "profileImageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 80,
    });

    sendResponse(res, 200, "Classroom recordings fetched", recordings);
  } catch (error) {
    next(error);
  }
});

router.post("/:classId/chat/recordings", requireTutorRole, async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (String(liveClass.tutorId) !== String(req.user.id)) {
      throw new ApiError("Only class tutor can upload recordings", 403);
    }

    const audioDataUrl = normalizeText(req.body?.audioDataUrl);
    const mimeType = normalizeText(req.body?.mimeType) || null;
    const fileName = normalizeText(req.body?.fileName) || null;
    const title = normalizeText(req.body?.title) || null;
    const durationSecondsRaw = Number(req.body?.durationSeconds);
    const durationSeconds = Number.isFinite(durationSecondsRaw) && durationSecondsRaw > 0
      ? Math.round(durationSecondsRaw)
      : null;

    if (!audioDataUrl) {
      throw new ApiError("Recording payload is required", 400);
    }

    if (!audioDataUrl.startsWith("data:audio/")) {
      throw new ApiError("Invalid recording payload", 400);
    }

    if (audioDataUrl.length > 35_000_000) {
      throw new ApiError("Recording payload too large", 413);
    }

    if (title && title.length > 120) {
      throw new ApiError("Recording title is too long", 400);
    }

    const recording = await OfflineClassRecording.create({
      classId: liveClass.id,
      tutorId: req.user.id,
      audioDataUrl,
      mimeType,
      fileName,
      title,
      durationSeconds,
    });

    const hydratedRecording = await OfflineClassRecording.findByPk(recording.id, {
      include: [
        {
          model: User,
          as: "tutor",
          attributes: ["id", "firstName", "lastName", "profileImageUrl"],
        },
      ],
    });

    sendResponse(res, 201, "Class recording uploaded", hydratedRecording);
  } catch (error) {
    next(error);
  }
});

router.patch("/:classId/chat/recordings/:recordingId", requireTutorRole, async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (String(liveClass.tutorId) !== String(req.user.id)) {
      throw new ApiError("Only class tutor can update recordings", 403);
    }

    const recording = await OfflineClassRecording.findOne({
      where: {
        id: req.params.recordingId,
        classId: liveClass.id,
      },
    });

    if (!recording) {
      throw new ApiError("Recording not found", 404);
    }

    const nextTitle = normalizeText(req.body?.title);
    if (!nextTitle) {
      throw new ApiError("Recording title is required", 400);
    }
    if (nextTitle.length > 120) {
      throw new ApiError("Recording title is too long", 400);
    }

    recording.title = nextTitle;
    await recording.save();

    sendResponse(res, 200, "Recording title updated", recording);
  } catch (error) {
    next(error);
  }
});

router.delete("/:classId/chat/recordings/:recordingId", requireTutorRole, async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (String(liveClass.tutorId) !== String(req.user.id)) {
      throw new ApiError("Only class tutor can delete recordings", 403);
    }

    const deletedCount = await OfflineClassRecording.destroy({
      where: {
        id: req.params.recordingId,
        classId: liveClass.id,
      },
    });

    if (!deletedCount) {
      throw new ApiError("Recording not found", 404);
    }

    sendResponse(res, 200, "Recording deleted", {
      id: req.params.recordingId,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:classId/chat/presence", async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (!liveClass.isActive) {
      throw new ApiError("Class is no longer active", 400);
    }

    const existing = await OfflineClassPresence.findOne({
      where: { classId: liveClass.id, userId: req.user.id },
    });

    if (existing) {
      existing.lastSeenAt = new Date();
      existing.userName = `${req.user.firstName || "User"} ${req.user.lastName || ""}`.trim();
      existing.role = req.user.role || null;
      await existing.save();
    } else {
      await OfflineClassPresence.create({
        classId: liveClass.id,
        userId: req.user.id,
        userName: `${req.user.firstName || "User"} ${req.user.lastName || ""}`.trim(),
        role: req.user.role || null,
        lastSeenAt: new Date(),
      });
    }

    await cleanupPresence(liveClass.id);

    sendResponse(res, 200, "Presence heartbeat updated", {
      classId: liveClass.id,
      userId: req.user.id,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:classId/chat/message", async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (!liveClass.isActive) {
      throw new ApiError("Class is no longer active", 400);
    }

    const state = await ensureChatState(liveClass.id);

    const senderIsTutor = String(liveClass.tutorId) === String(req.user.id);
    if (state.repliesLocked && !senderIsTutor) {
      throw new ApiError("Tutor has locked replies for now", 403);
    }

    const text = normalizeText(req.body?.text);
    const imageDataUrl = normalizeText(req.body?.imageDataUrl);
    const audioDataUrl = normalizeText(req.body?.audioDataUrl);

    if (!text && !imageDataUrl && !audioDataUrl) {
      throw new ApiError("Message text, image, or audio is required", 400);
    }

    if (imageDataUrl) {
      if (!imageDataUrl.startsWith("data:image/")) {
        throw new ApiError("Invalid image payload", 400);
      }
      if (imageDataUrl.length > 8_000_000) {
        throw new ApiError("Image payload too large", 413);
      }
    }

    if (audioDataUrl) {
      if (!audioDataUrl.startsWith("data:audio/")) {
        throw new ApiError("Invalid audio payload", 400);
      }
      if (audioDataUrl.length > 8_000_000) {
        throw new ApiError("Audio payload too large", 413);
      }
    }

    const message = await OfflineClassChatMessage.create({
      classId: liveClass.id,
      senderId: req.user.id,
      text: text || null,
      imageDataUrl: imageDataUrl || null,
      audioDataUrl: audioDataUrl || null,
    });

    const hydratedMessage = await OfflineClassChatMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "profileImageUrl", "role"],
        },
      ],
    });

    sendResponse(res, 201, "Classroom message sent", hydratedMessage);
  } catch (error) {
    next(error);
  }
});

router.patch("/:classId/chat/settings", requireTutorRole, async (req, res, next) => {
  try {
    const liveClass = await ensureClass(req.params.classId, req.user);

    if (String(liveClass.tutorId) !== String(req.user.id)) {
      throw new ApiError("Only class tutor can update chat settings", 403);
    }

    const state = await ensureChatState(liveClass.id);

    if (typeof req.body?.repliesLocked === "boolean") {
      state.repliesLocked = req.body.repliesLocked;
    }

    if (req.body?.pinnedAnnouncement !== undefined) {
      state.pinnedAnnouncement = normalizeText(req.body.pinnedAnnouncement) || null;
    }

    state.updatedBy = req.user.id;
    await state.save();

    sendResponse(res, 200, "Classroom chat settings updated", {
      classId: liveClass.id,
      repliesLocked: Boolean(state.repliesLocked),
      pinnedAnnouncement: state.pinnedAnnouncement || "",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
