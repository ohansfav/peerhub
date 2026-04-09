import React from "react";
import { useNavigate } from "react-router-dom";
import { useChatContext, Avatar } from "stream-chat-react";
import "./channelPreview.css";
import { useAuth } from "../../hooks/useAuthContext";

const CustomChannelPreview = ({ channel }) => {
  const { client } = useChatContext();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const otherMember = Object.values(channel.state.members).find(
    (m) => m.user.id !== client.userID
  );
  const unreadCount = channel.countUnread();

  const handleClick = () => {
    const role = authUser.role;
    const routePrefix = role === "tutor" ? "/tutor" : "/student";
    navigate(`${routePrefix}/chat/${otherMember.user.id}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.abs(now - messageTime) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffInHours < 168) {
      return messageTime.toLocaleDateString([], { weekday: "short" });
    }
    return messageTime.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div onClick={handleClick} className="channel-preview">
      <Avatar
        image={otherMember?.user.image}
        name={otherMember?.user.name}
        size={44}
      />
      <div className="channel-info min-w-0">
        {" "}
        {/* important */}
        <div className="channel-top">
          <div className="channel-name truncate">
            {otherMember?.user.name || "Unknown User"}
          </div>
          {lastMessage?.created_at && (
            <div className="timestamp flex-shrink-0">
              {formatTime(lastMessage.created_at)}
            </div>
          )}
        </div>
        <div className="channel-bottom">
          <div className="last-message">
            {lastMessage?.text || (
              <span className="italic text-gray-400">No messages yet</span>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="unread-count flex-shrink-0">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomChannelPreview;
