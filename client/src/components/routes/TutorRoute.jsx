import RouteGuard from "./RouteGuard";

export default function TutorRoute({ children }) {
  return (
    <RouteGuard
      requireAuth
      requireVerified
      requireOnboarded={true}
      requireTutorRole
    >
      {children}
    </RouteGuard>
  );
}
