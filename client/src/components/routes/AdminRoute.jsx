import RouteGuard from "./RouteGuard";

/**
 * AdminRoute component that wraps children with RouteGuard
 *
 * @param {Object} props
 * @param {ReactNode} props.children - The child components to render
 * @returns {JSX.Element} - The rendered component or a redirect
 * @description This component checks if the user is authenticated, verified,
 * and has an admin role. If the user meets these criteria, it renders the children components.
 * Otherwise, it redirects to the home page.
 */
export default function AdminRoute({ children }) {
  return (
    <RouteGuard requireAuth requireAdminRole={true}>
      {children}
    </RouteGuard>
  );
}
