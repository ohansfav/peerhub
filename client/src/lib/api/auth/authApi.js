import { axiosInstance } from "../axios";

export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data.data || null;
  } catch (error) {
    return null;
  }
};

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data.data;
};

export const verifyEmail = async (code) => {
  const response = await axiosInstance.post("/auth/verify-email", code);
  return response.data.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", email);
  return response.data.data;
};

export const resetPassword = async ({ token, password }) => {
  const response = await axiosInstance.post(`/auth/reset/${token}`, {
    password,
  });
  return response.data.data;
};

export const resendVerificationEmail = async () => {
  const response = await axiosInstance.post("/auth/resend-email-verification");
  return response.data.data;
};

export async function changePassword(passwordData) {
  const response = await axiosInstance.put(
    "/auth/change-password",
    passwordData
  );
  return response.data.data;
}

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data.data;
};

// export async function updateProfile(profileData) {
//     const response = await axiosInstance.put("/users/profile", profileData);
//     return response.data.data;
// }
