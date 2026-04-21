import { axiosInstance } from "../axios";

export const fetchStudentDirectory = async ({ page = 1, limit = 100, search = "" } = {}) => {
  const { data } = await axiosInstance.get("/student", {
    params: {
      page,
      limit,
      search: String(search || "").trim() || undefined,
    },
  });

  const payload = data?.data || {};
  const rows = Array.isArray(payload.rows) ? payload.rows : [];

  return rows.map((student) => {
    const user = student?.user || {};
    return {
      id: user.id,
      fullName: `${user.firstName || "Student"} ${user.lastName || ""}`.trim(),
      email: user.email || "",
    };
  });
};
