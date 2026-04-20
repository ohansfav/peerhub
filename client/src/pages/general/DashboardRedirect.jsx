import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../../hooks/auth/useFetchAuthUser";
import PageLoader from "../../components/common/PageLoader";
import { useQueryClient } from "@tanstack/react-query";

const DashboardRedirect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoading, authUser } = useAuthUser();

  useEffect(() => {
    if (!isLoading && authUser) {
      // Role-based redirect
      if (!authUser.isOnboarded) {
        navigate("/role-selection");
      } else if (authUser.role === 'student') {
        navigate("/student/dashboard");
      } else if (authUser.role === 'tutor') {
        navigate("/tutor/dashboard");
      } else if (authUser.role === 'admin') {
        navigate("/admin/dashboard");
      }
    }
  }, [isLoading, authUser, navigate]);

  return <PageLoader />;
};

export default DashboardRedirect;

