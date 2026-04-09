import { Navigate } from "react-router";
import { useAuth } from "../../hooks/useAuthContext";

const DISABLE_ROUTE_GUARDS =
  import.meta.env.VITE_DISABLE_ROUTE_GUARDS === "true";

/**
 * RouteGuard handles auth, verification, and onboarding checks.
 *
 * @param {Object} props
 * @param {boolean} requireAuth - Must be logged in
 * @param {boolean} requireVerified - true = must be verified, false = must be unverified, undefined = no check
 * @param {boolean} requireOnboarded - true = must be onboarded, false = must NOT be onboarded, undefined = no check
 * @param {boolean} publicOnly - Page only for unauthenticated users
 * @param {ReactNode} props.children
 */
const RouteGuard = ({
  requireAuth = false,
  requireAdminRole = false,
  requireStudentRole = false,
  requireTutorRole = false,
  requireVerified,
  requireOnboarded,
  publicOnly = false,
  children,
}) => {
  const { authUser } = useAuth();

  if (DISABLE_ROUTE_GUARDS) {
    return children;
  }

  const getDashboardRoute = (role) => {
    if (!role) return "/role-selection";

    switch (role) {
      case "student":
        return "/student/dashboard";
      case "tutor":
        return "/tutor/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  // Public-only pages (login/signup/etc.)
  if (publicOnly && authUser) {
    // SKIP EMAIL VERIFICATION (will implement later)
    // if (!authUser.isVerified) return <Navigate to="/verify-email" replace />;
    if (!authUser.isOnboarded) return <Navigate to="/role-selection" replace />;
    return <Navigate to={getDashboardRoute(authUser.role)} replace />;
  }

  // Require login
  if (requireAuth && !authUser) return <Navigate to="/login" replace />;

  if (authUser) {
    // Verification checks - DISABLED FOR NOW (skip email verification page)
    // if (requireVerified !== false && !authUser.isVerified)
    //   return <Navigate to="/verify-email" replace />;

    // if (requireVerified === false && authUser.isVerified)
    //   return <Navigate to={getDashboardRoute(authUser.role)} replace />;

    // Onboarding checks
    if (requireOnboarded === true && !authUser.isOnboarded)
      return <Navigate to="/role-selection" replace />;

    if (requireOnboarded === false && authUser.isOnboarded)
      return <Navigate to={getDashboardRoute(authUser.role)} replace />;

    // Role checks
    if (requireAdminRole && authUser.role !== "admin")
      return <Navigate to={getDashboardRoute(authUser.role)} replace />;

    if (requireStudentRole && authUser.role !== "student")
      return <Navigate to={getDashboardRoute(authUser.role)} replace />;

    if (requireTutorRole && authUser.role !== "tutor")
      return <Navigate to={getDashboardRoute(authUser.role)} replace />;
  }

  return children;
};

export default RouteGuard;
