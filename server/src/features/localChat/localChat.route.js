const express = require("express");
const { Op } = require("sequelize");
const {
  protectRoute,
  requireVerifiedAndOnboardedUser,
} = require("@features/auth/auth.middleware");
const { LocalChatMessage, User } = require("@models");
const ApiError = require("@utils/apiError");
const sendResponse = require("@utils/sendResponse");

const router = express.Router();

router.use(protectRoute);
router.use(requireVerifiedAndOnboardedUser);

router.get("/conversations", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    const messages = await LocalChatMessage.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { recipientId: currentUserId },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "profileImageUrl", "role"],
        },
        {
          model: User,
          as: "recipient",
          attributes: ["id", "firstName", "lastName", "profileImageUrl", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 500,
    });

    const map = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId === currentUserId;
      const otherUser = isSender ? msg.recipient : msg.sender;
      if (!otherUser) continue;

      if (!map.has(otherUser.id)) {
        map.set(otherUser.id, {
          otherUser,
          lastMessage: {
            id: msg.id,
            text: msg.text,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            readAt: msg.readAt,
          },
          unreadCount: 0,
        });
      }

      if (!isSender && !msg.readAt) {
        const entry = map.get(otherUser.id);
        entry.unreadCount += 1;
      }
    }

    sendResponse(res, 200, "Conversations fetched", Array.from(map.values()));
  } catch (error) {
    next(error);
  }
});

router.get("/thread/:userId", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    const otherUser = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "profileImageUrl", "role"],
    });

    if (!otherUser) {
      throw new ApiError("User not found", 404);
    }

    const messages = await LocalChatMessage.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [{ senderId: currentUserId }, { recipientId: userId }],
          },
          {
            [Op.and]: [{ senderId: userId }, { recipientId: currentUserId }],
          },
        ],
      },
      order: [["createdAt", "ASC"]],
      limit: 500,
    });

    sendResponse(res, 200, "Thread fetched", {
      otherUser,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/thread/:userId", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;
    const text = String(req.body?.text || "").trim();

    if (!text) {
      throw new ApiError("Message text is required", 400);
    }

    if (currentUserId === userId) {
      throw new ApiError("Cannot send message to yourself", 400);
    }

    const recipient = await User.findByPk(userId, {
      attributes: ["id"],
    });

    if (!recipient) {
      throw new ApiError("Recipient not found", 404);
    }

    const message = await LocalChatMessage.create({
      senderId: currentUserId,
      recipientId: userId,
      text,
    });

    sendResponse(res, 201, "Message sent", message);
  } catch (error) {
    next(error);
  }
});

router.patch("/thread/:userId/read", async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.params;

    await LocalChatMessage.update(
      { readAt: new Date() },
      {
        where: {
          senderId: userId,
          recipientId: currentUserId,
          readAt: null,
        },
      }
    );

    sendResponse(res, 200, "Thread marked as read");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
