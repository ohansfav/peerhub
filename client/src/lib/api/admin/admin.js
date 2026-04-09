import { axiosInstance } from "../axios";

// =====================
// User Routes
// =====================
export const getAllUsers = async (role, query = {}) => {
  const params = {};

  if (role) {
    params.role = role;
  }

  if (query?.page) {
    params.page = query.page;
  }

  if (query?.limit) {
    params.limit = query.limit;
  }

  if (query?.search) {
    params.search = query.search;
  }

  const { data } = await axiosInstance.get("/admin/users", {
    params,
  });

  return data.data;
};

export const getUserById = async (id) => {
  const { data } = await axiosInstance.get(`/admin/users/${id}`);
  return data.data;
};

export const restoreUser = async (id) => {
  const { data } = await axiosInstance.patch(`/admin/users/${id}/restore`);
  return data.data;
};

export const getUserCounts = async () => {
  const { data } = await axiosInstance.get("/admin/users/counts");
  return data.data;
};

// =====================
// Pending Tutor Routes
// =====================
export const getPendingTutors = async () => {
  const { data } = await axiosInstance.get("/admin/tutors/pending");
  return data.data;
};
export const getPendingTutorById = async (id) => {
  const { data } = await axiosInstance.get(`/admin/tutors/${id}/pending`);
  return data.data;
};

export const getTutorDocumentUrl = async (tutorId) => {
  const url = `/admin/tutors/${tutorId}/file`;

  const { data } = await axiosInstance.get(url);

  return data.data;
};

export const approveTutor = async (id) => {
  const { data } = await axiosInstance.patch(`/admin/tutors/${id}/approve`);
  return data.data;
};

export const rejectTutor = async (id, rejectionReason) => {
  const payload =
    rejectionReason && typeof rejectionReason === "object"
      ? rejectionReason
      : { rejectionReason };

  const { data } = await axiosInstance.patch(
    `/admin/tutors/${id}/reject`,
    payload,
  );
  return data.data;
};

// =====================
// Super Admin Routes
// =====================

export const createAdmin = async (adminData) => {
  const { data } = await axiosInstance.post("/admin", adminData);
  return data.data;
};

export const getAllAdmins = async () => {
  const { data } = await axiosInstance.get("/admin");
  return data.data;
};

// export const suspendUser = async (id) => {
//   const { data } = await axiosInstance.put(`/admin/users/${id}/suspend`);
//   return data.data;
// };

// export const unsuspendUser = async (id) => {
//   const { data } = await axiosInstance.put(`/admin/users/${id}/unsuspend`);
//   return data.data;
// };

// export const deleteUser = async (id) => {
//   const { data } = await axiosInstance.delete(`/admin/users/${id}`);
//   return data.data;
// };
