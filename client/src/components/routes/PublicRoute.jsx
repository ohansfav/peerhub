import { Outlet } from "react-router-dom";
import RouteGuard from "./RouteGuard";

/**
 * PublicRoute component that wraps children with RouteGuard
 * to ensure they are only accessible when not authenticated.
 * @param {Object} props
 * @param {ReactNode} props.children - The child components to render
 * @returns {JSX.Element} - The wrapped children with RouteGuard
 */

const PublicOnlyRoute = () => (
  <RouteGuard publicOnly>
    <Outlet />
  </RouteGuard>
);

export default PublicOnlyRoute;
