import { useQuery } from "@tanstack/react-query";
import { getTutorDocumentUrl } from "../../lib/api/admin/admin";

function buildTutorDocumentKey(id) {
  return ["tutor", id, "document"];
}

const defaultSelect = (data) => {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    return (
      data.documentUrl ??
      data.url ??
      data.link ??
      (typeof data.data === "object" ? data.data?.documentUrl : null) ??
      null
    );
  }
  return null;
};

export function useTutorDocument({ id, enabled = true, ...options }) {
  const { select: customSelect, ...rest } = options;

  return useQuery({
    queryKey: buildTutorDocumentKey(id),
    queryFn: () => getTutorDocumentUrl(id),
    enabled: Boolean(id) && enabled,
    select: customSelect ?? defaultSelect,
    ...rest,
  });
}
