import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDateTime } from "../../utils/time";

const NotificationDropdown = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640); // Tailwind "sm"
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const handleNotificationClick = (notification) => {
    if (notification.action?.link) {
      onMarkAsRead(notification.id);
      onClose();
      navigate(notification.action.link);
    }
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    onClose();
  };

  const renderNotifications = () => (
    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-12 h-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p>No new notifications</p>
          </div>
        </div>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  n.type === "session"
                    ? "bg-blue-100 text-blue-600"
                    : n.type === "request"
                    ? "bg-yellow-100 text-yellow-600"
                    : n.type === "success"
                    ? "bg-green-100 text-green-600"
                    : n.type === "warning"
                    ? "bg-red-100 text-red-600"
                    : n.type === "alert"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {n.sender.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                {n.sender !== "System" && (
                  <p className="text-sm font-semibold text-gray-800">
                    {n.sender}
                  </p>
                )}
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateTime(n.timestamp)}
                </p>
                <div className="flex gap-2 mt-2">
                  {n.action && (
                    <button
                      className="text-xs text-blue-600 hover:underline font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(n);
                      }}
                    >
                      {n.action.label} →
                    </button>
                  )}
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(n.id);
                    }}
                  >
                    Mark as read
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return isMobile ? (
    // ✅ Mobile modal (centered)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-11/12 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
        {renderNotifications()}
        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  ) : (
    // ✅ Desktop dropdown
    <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ✕
        </button>
      </div>
      {renderNotifications()}
      {notifications.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
