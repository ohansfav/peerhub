import RouteGuard from "./RouteGuard";
import { Outlet } from "react-router-dom";

export default function PrivateRoute({ children }) {
  return (
    <RouteGuard requireAuth requireVerified requireOnboarded>
      {children}
    </RouteGuard>
  );
}
