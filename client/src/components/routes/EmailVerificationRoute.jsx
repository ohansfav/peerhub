import RouteGuard from "./RouteGuard";

/**
 * EmailVerificationRoute component that wraps children with RouteGuard
 * to ensure they are only accessible when the user is authenticated
 * and NOT verified
 * @param {Object} props
 * @param {ReactNode} props.children - The child components to render
 * @returns {JSX.Element} - The wrapped children with RouteGuard
 */
export default function EmailVerificationRoute({ children }) {
  return (
    <RouteGuard requireAuth requireVerified={false}>
      {children}
    </RouteGuard>
  );
}
