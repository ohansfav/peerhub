import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../../lib/api/admin/admin";

export const USERS_QUERY_KEY = ["users"];

function buildQueryKey({ role, page, limit, search }) {
  const key = [...USERS_QUERY_KEY];

  const filters = {};

  if (role) {
    filters.role = role;
  }

  if (typeof page === "number") {
    filters.page = page;
  }

  if (typeof limit === "number") {
    filters.limit = limit;
  }

  if (search) {
    filters.search = search;
  }

  if (Object.keys(filters).length > 0) {
    key.push(filters);
  }

  return key;
}

const defaultSelect = (data) => {
  if (!data) {
    return { users: [], meta: null };
  }

  if (Array.isArray(data)) {
    return { users: data, meta: null };
  }

  const users = Array.isArray(data.users) ? data.users : [];
  const meta = data.meta ?? null;

  return { users, meta };
};

export function useUsers({
  role,
  page = 1,
  limit = 10,
  search,
  enabled = true,
  ...queryOptions
} = {}) {
  const { select: customSelect, ...restOptions } = queryOptions;
  const queryKey = buildQueryKey({ role, page, limit, search });

  return useQuery({
    queryKey,
    queryFn: () => getAllUsers(role, { page, limit, search }),
    enabled,
    select: customSelect ?? defaultSelect,
    ...restOptions,
  });
}
