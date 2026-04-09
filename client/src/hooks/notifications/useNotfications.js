import { useState, useEffect } from "react";
import { useStudentNotifications } from "./useStudentNotifications";
import { useTutorNotifications } from "./useTutorNotifications";
// import { useAdminNotifications } from "./useAdminNotifications";

export function useNotifications(userRole) {
  // Only call the hook for the current user's role
  const studentNotifs = useStudentNotifications(userRole === "student");
  const tutorNotifs = useTutorNotifications(userRole === "tutor");
  // const adminNotifs = useAdminNotifications(userRole === "admin");

  let selectedNotifs = { notifications: [], isLoading: false };
  if (userRole === "student") selectedNotifs = studentNotifs;
  if (userRole === "tutor") selectedNotifs = tutorNotifs;
  // if (userRole === "admin") selectedNotifs = adminNotifs;

  const { notifications = [], isLoading = false } = selectedNotifs;

  // Load read IDs from localStorage (scoped by role)
  const [readIds, setReadIds] = useState([]);

  // Load when role changes
  useEffect(() => {
    if (!userRole) return; // don’t load until we know the role
    const saved = localStorage.getItem(`readNotifications_${userRole}`);
    if (saved) {
      const parsed = JSON.parse(saved).map((id) => String(id));
      setReadIds((prev) => {
        const merged = new Set([...prev, ...parsed]);
        return [...merged];
      });
    }
  }, [userRole]);

  // Persist to localStorage
  useEffect(() => {
    if (!userRole || readIds.length === 0) return;
    localStorage.setItem(
      `readNotifications_${userRole}`,
      JSON.stringify(readIds)
    );
  }, [readIds, userRole]);

  // Cleanup old read IDs (30 days)
  useEffect(() => {
    if (!notifications.length) return;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const validIds = readIds.filter((id) => {
      const notification = notifications.find((n) => n.id === id);
      return notification && new Date(notification.timestamp) > thirtyDaysAgo;
    });

    if (validIds.length !== readIds.length) {
      setReadIds(validIds);
    }
  }, [notifications, readIds]);

  // helper to normalize all IDs to strings
  const normalizeId = (id) => String(id);

  const unreadNotifications = notifications.filter(
    (n) => !readIds.includes(normalizeId(n.id))
  );

  const markAsRead = (id) => {
    setReadIds((prev) => [...new Set([...prev, normalizeId(id)])]);
  };

  const markAllAsRead = () => {
    setReadIds(notifications.map((n) => normalizeId(n.id)));
  };

  return {
    notifications,
    unreadNotifications,
    unreadCount: unreadNotifications.length,
    markAsRead,
    markAllAsRead,
    isLoading,
  };
}
