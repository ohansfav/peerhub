import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../../lib/api/admin/admin";

export function buildAdminUserQueryKey(id) {
  return ["admin", "user", id];
}

const defaultSelect = (data) => {
  if (!data) return data;
  return {
    ...data,
    tutor: data.tutor ?? null,
    student: data.student ?? null,
    raw: data,
  };
};

export function useAdminUser({ id, enabled = true, ...options }) {
  const { select: customSelect, ...rest } = options;

  return useQuery({
    queryKey: buildAdminUserQueryKey(id),
    queryFn: () => getUserById(id),
    enabled: Boolean(id) && enabled,
    select: customSelect ?? defaultSelect,
    ...rest,
  });
}
