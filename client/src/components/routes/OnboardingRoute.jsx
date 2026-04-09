import { Outlet } from "react-router-dom";
import RouteGuard from "./RouteGuard";

export default function OnboardingRoute() {
  return (
    <RouteGuard requireAuth requireVerified requireOnboarded={false}>
      <Outlet />
    </RouteGuard>
  );
}
