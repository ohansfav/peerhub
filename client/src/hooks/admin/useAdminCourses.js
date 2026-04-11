import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
} from "../../lib/api/admin/admin";
import { handleToastError, handleToastSuccess } from "../../utils/toastDisplayHandler";

export const ADMIN_COURSES_QUERY_KEY = ["admin-courses"];

export function useAdminCourses(query = {}) {
  return useQuery({
    queryKey: [...ADMIN_COURSES_QUERY_KEY, query],
    queryFn: () => getAdminCourses(query),
    select: (data) => {
      if (!data) return { courses: [], meta: null };
      return {
        courses: Array.isArray(data.data) ? data.data : [],
        meta: data.meta ?? null,
      };
    },
  });
}

export function useCreateAdminCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseData) => createAdminCourse(courseData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_QUERY_KEY });
      handleToastSuccess("Course created successfully.");
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to create course.");
      options?.onError?.(error, variables, context);
    },
  });
}

export function useUpdateAdminCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAdminCourse(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_QUERY_KEY });
      handleToastSuccess("Course updated successfully.");
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to update course.");
      options?.onError?.(error, variables, context);
    },
  });
}

export function useDeleteAdminCourse(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteAdminCourse(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COURSES_QUERY_KEY });
      handleToastSuccess("Course deleted successfully.");
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleToastError(error, "Failed to delete course.");
      options?.onError?.(error, variables, context);
    },
  });
}
