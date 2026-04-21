const {
  sendUnreadMessageEmail,
} = require("@src/shared/email/email.service.js");
const { generateStreamToken } = require("../../shared/config/stream.config.js");
const ApiError = require("../../shared/utils/apiError");
const sendResponse = require("../../shared/utils/sendResponse");
const logger = require("@src/shared/utils/logger.js");

const extractChannelData = (event) => {
  if (event?.channel) return event.channel;
  if (event?.channels && typeof event.channels === "object") {
    const first = Object.values(event.channels)[0];
    if (first) return first;
  }
  return {};
};

const isRepliesLocked = (channelData) =>
  Boolean(
    channelData?.repliesLocked ??
      channelData?.data?.repliesLocked ??
      channelData?.custom?.repliesLocked
  );

const getInstructorId = (channelData) =>
  String(
    channelData?.instructorId ??
      channelData?.data?.instructorId ??
      channelData?.custom?.instructorId ??
      ""
  );

const getSenderId = (event) =>
  String(event?.user?.id ?? event?.message?.user?.id ?? "");

exports.handleStreamWebhook = async (req, res, next) => {
  try {
    const event = req.body;

    if (event.type === "before_message_send") {
      const channelData = extractChannelData(event);

      const repliesLocked = isRepliesLocked(channelData);
      if (!repliesLocked) {
        return res.status(200).json({});
      }

      const instructorId = getInstructorId(channelData);
      const senderId = getSenderId(event);

      if (instructorId && senderId && instructorId !== senderId) {
        return res.status(403).json({
          message: "Classroom replies are locked by tutor.",
        });
      }

      return res.status(200).json({});
    }

    if (event.type !== "user.unread_message_reminder") {
      return sendResponse(res, 200, "Event ignored");
    }

    logger.info("unread message reminder event received", event.type);

    const { email, name: userName } = event.user;

    const channel = extractChannelData(event);

    const unreadCount = channel?.messages?.length || 0;

    const senderName =
      channel?.messages
        .map((msg) => msg.user?.name)
        .find((name) => name !== userName) || "";

    if (!email) {
      throw new ApiError("User email not found in Stream webhook payload", 400);
    }

    await sendUnreadMessageEmail(email, userName, unreadCount, senderName);

    sendResponse(res, 200, "Unread message email sent");
  } catch (error) {
    next(error);
  }
};

exports.getStreamToken = async (req, res, next) => {
  try {
    const token = generateStreamToken(req.user.id);

    sendResponse(res, 200, "", { token: token });
  } catch (error) {
    next(error);
  }
};
