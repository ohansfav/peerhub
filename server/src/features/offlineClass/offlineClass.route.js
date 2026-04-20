const express = require("express");
const crypto = require("crypto");
const {
  protectRoute,
  requireVerifiedAndOnboardedUser,
  requireTutorRole,
} = require("@features/auth/auth.middleware");
const sendResponse = require("@utils/sendResponse");
const ApiError = require("@utils/apiError");

const router = express.Router();

const classes = new Map();

router.use(protectRoute);
router.use(requireVerifiedAndOnboardedUser);

router.get("/active", async (req, res) => {
  const activeClasses = [...classes.values()]
    .filter((liveClass) => liveClass.isActive)
    .map((liveClass) => ({
      id: liveClass.id,
      tutorId: liveClass.tutorId,
      tutorName: liveClass.tutorName,
      title: liveClass.title,
      startedAt: liveClass.startedAt,
      lastFrameAt: liveClass.lastFrameAt,
    }));

  sendResponse(res, 200, "Active offline classes fetched", activeClasses);
});

router.post("/start", requireTutorRole, async (req, res, next) => {
  try {
    const existingActiveClass = [...classes.values()].find(
      (liveClass) => liveClass.isActive,
    );

    if (existingActiveClass) {
      return sendResponse(res, 200, "An offline class is already active", {
        createdNew: false,
        id: existingActiveClass.id,
        tutorId: existingActiveClass.tutorId,
        tutorName: existingActiveClass.tutorName,
        title: existingActiveClass.title,
        startedAt: existingActiveClass.startedAt,
      });
    }

    const title = String(req.body?.title || "Open Offline Class").trim();
    const classId = crypto.randomUUID();

    const liveClass = {
      id: classId,
      tutorId: req.user.id,
      tutorName: `${req.user.firstName || "Tutor"} ${req.user.lastName || ""}`.trim(),
      title,
      isActive: true,
      startedAt: new Date().toISOString(),
      endedAt: null,
      frameDataUrl: null,
      lastFrameAt: null,
    };

    classes.set(classId, liveClass);

    sendResponse(res, 201, "Offline class started", {
      createdNew: true,
      id: liveClass.id,
      tutorId: liveClass.tutorId,
      tutorName: liveClass.tutorName,
      title: liveClass.title,
      startedAt: liveClass.startedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:classId", async (req, res, next) => {
  try {
    const liveClass = classes.get(req.params.classId);
    if (!liveClass) {
      throw new ApiError("Offline class not found", 404);
    }

    sendResponse(res, 200, "Offline class fetched", {
      id: liveClass.id,
      tutorId: liveClass.tutorId,
      tutorName: liveClass.tutorName,
      title: liveClass.title,
      isActive: liveClass.isActive,
      startedAt: liveClass.startedAt,
      endedAt: liveClass.endedAt,
      lastFrameAt: liveClass.lastFrameAt,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:classId/frame", requireTutorRole, async (req, res, next) => {
  try {
    const liveClass = classes.get(req.params.classId);
    if (!liveClass) {
      throw new ApiError("Offline class not found", 404);
    }

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
    liveClass.lastFrameAt = new Date().toISOString();

    sendResponse(res, 200, "Frame updated", {
      classId: liveClass.id,
      lastFrameAt: liveClass.lastFrameAt,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:classId/frame", async (req, res, next) => {
  try {
    const liveClass = classes.get(req.params.classId);
    if (!liveClass) {
      throw new ApiError("Offline class not found", 404);
    }

    if (!liveClass.isActive) {
      throw new ApiError("Class has ended", 410);
    }

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

router.post("/:classId/end", requireTutorRole, async (req, res, next) => {
  try {
    const liveClass = classes.get(req.params.classId);
    if (!liveClass) {
      throw new ApiError("Offline class not found", 404);
    }

    if (liveClass.tutorId !== req.user.id) {
      throw new ApiError("Only the class tutor can end this class", 403);
    }

    liveClass.isActive = false;
    liveClass.endedAt = new Date().toISOString();

    sendResponse(res, 200, "Offline class ended", {
      id: liveClass.id,
      endedAt: liveClass.endedAt,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
