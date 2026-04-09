import { useQuery } from "@tanstack/react-query";
import { getPendingTutors } from "../../lib/api/admin/admin";

export const PENDING_TUTORS_QUERY_KEY = ["tutors", "pending"];

const normalizePendingTutor = (entry) => {
  if (!entry) return entry;

  const user = entry.user ?? {};
  const id = entry.userId ?? user.id ?? entry.id;
  const documentUrl =
    entry.documentUrl ?? user.documentUrl ?? entry?.tutor?.documentUrl ?? null;

  return {
    id,
    email: user.email ?? entry.email ?? null,
    firstName: user.firstName ?? entry.firstName ?? null,
    lastName: user.lastName ?? entry.lastName ?? null,
    createdAt: user.createdAt ?? entry.createdAt ?? null,
    appliedAt: entry.appliedAt ?? entry.createdAt ?? null,
    approvalStatus: entry.approvalStatus ?? user?.tutor?.approvalStatus ?? null,
    bio: entry.bio ?? null,
    education: entry.education ?? null,
    rating: entry.rating ?? null,
    profileVisibility: entry.profileVisibility ?? null,
    subjects: Array.isArray(entry.subjects) ? entry.subjects : [],
    documentUrl,
    user,
    raw: entry,
  };
};

const defaultSelect = (data) => {
  if (!data) return [];
  if (!Array.isArray(data)) return [];
  return data.map((entry) => normalizePendingTutor(entry));
};

export function usePendingTutors(options = {}) {
  const { select: customSelect, ...rest } = options;

  return useQuery({
    queryKey: PENDING_TUTORS_QUERY_KEY,
    queryFn: getPendingTutors,
    select: customSelect ?? defaultSelect,
    ...rest,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true, // Stop polling when tab is not visible (default)
  });
}
