import RouteGuard from "./RouteGuard";

export default function StudentRoute({ children }) {
  return (
    <RouteGuard
      requireAuth
      requireVerified
      requireOnboarded={true}
      requireStudentRole
    >
      {children}
    </RouteGuard>
  );
}
