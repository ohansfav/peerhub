const express = require("express");
const { protectRoute, requireVerifiedAndOnboardedUser } = require("@features/auth/auth.middleware");
const { BroadcastMessage, User } = require("@models");
const sendResponse = require("@utils/sendResponse");
const ApiError = require("@utils/apiError");
const { Op } = require("sequelize");

const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedAndOnboardedUser);

// GET /api/broadcast - Get broadcast messages relevant to current user
router.get("/", async (req, res, next) => {
  try {
    const userRole = req.user.role;

    const messages = await BroadcastMessage.findAll({
      where: {
        [Op.or]: [
          { targetRole: null },
          { targetRole: userRole },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    sendResponse(res, 200, "Broadcast messages fetched", messages);
  } catch (error) {
    next(error);
  }
});

// POST /api/broadcast - Create a broadcast message (tutor or admin)
router.post("/", async (req, res, next) => {
  try {
    if (req.user.role !== "tutor" && req.user.role !== "admin") {
      throw new ApiError("Only tutors and admins can send broadcast messages", 403);
    }

    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      throw new ApiError("Title and message are required", 400);
    }

    if (targetRole && !["student", "tutor"].includes(targetRole)) {
      throw new ApiError("targetRole must be 'student', 'tutor', or omitted for everyone", 400);
    }

    const broadcast = await BroadcastMessage.create({
      senderId: req.user.id,
      title,
      message,
      targetRole: targetRole || null,
    });

    const fullBroadcast = await BroadcastMessage.findByPk(broadcast.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
    });

    sendResponse(res, 201, "Broadcast message sent", fullBroadcast);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/broadcast/:id - Delete a broadcast message (sender or admin)
router.delete("/:id", async (req, res, next) => {
  try {
    const msg = await BroadcastMessage.findByPk(req.params.id);
    if (!msg) throw new ApiError("Message not found", 404);

    if (msg.senderId !== req.user.id && req.user.role !== "admin") {
      throw new ApiError("You can only delete your own messages", 403);
    }

    await msg.destroy();
    sendResponse(res, 200, "Message deleted");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
