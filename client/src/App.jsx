import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/landing/HomePage";
import StudentOnboardingPage from "./pages/onboarding/StudentOnboardingPage";
import TutorOnboardingPage from "./pages/onboarding/TutorOnboardingPage";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import RoleSelectionPage from "./pages/onboarding/RoleSelectionPage";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import TutorDashboardPage from "./pages/tutor/TutorDashboardPage";
import { Toaster } from "react-hot-toast";
import PublicOnlyRoute from "./components/routes/PublicRoute";
import EmailVerificationRoute from "./components/routes/EmailVerificationRoute";
import AdminRoute from "./components/routes/AdminRoute";
import OnboardingRoute from "./components/routes/OnboardingRoute";
import NotFoundPage from "./pages/general/NotFoundPage";
import Layout from "./layouts/Layout";
import {
  adminSidebarLinks,
  studentSidebarLinks,
  tutorSidebarLinks,
} from "./utils/sideBarLinks";
import StudentRoute from "./components/routes/StudentRoute";
import TutorRoute from "./components/routes/TutorRoute";
import StudentLibraryPage from "./pages/student/StudentLibraryPage";
import StudentTutorsPage from "./pages/student/StudentTutorsPage";
import FAQPage from "./pages/general/FAQPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminManageAdminsPage from "./pages/admin/AdminManageAdminsPage";
import StudentBookingPage from "./pages/student/StudentBookingPage";
import AdminTutorsPage from "./pages/admin/AdminTutorsPage";
import TutorSessionsPage from "./pages/tutor/TutorSessionsPage";
import TutorAvailabilityPage from "./pages/tutor/TutorAvailabilityPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import AdminTutorsProfilePage from "./pages/admin/AdminTutorsProfilePage";
import AdminStudentsProfilePage from "./pages/admin/AdminStudentsProfilePage";
import ChatPage from "./pages/messaging/ChatPage";
import CallPage from "./pages/messaging/CallPage";
import RecentChatsPage from "./pages/messaging/RecentChatsPage";
import TutorPrivateProfilePage from "./pages/tutor/TutorPrivateProfilePage";
import BookingRequestsPage from "./pages/tutor/BookingRequestsPage";
import StudentSessionsPage from "./pages/student/StudentSessionsPage";
import StudentTutorProfilePage from "./pages/student/StudentTutorProfilePage";
import AccountSettingsPage from "./pages/general/AccountSettingsPage";

export default function App() {
  const location = useLocation();

  return (
    <>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<HomePage />} />

        {/* Public-only routes: accessible only if NOT logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
        </Route>

        {/* Email verification route: accessible only if logged in and NOT verified */}
        <Route
          path="/verify-email"
          element={
            <EmailVerificationRoute>
              <EmailVerificationPage />
            </EmailVerificationRoute>
          }
        />

        {/* Onboarding routes: accessible only if logged in, verified, but NOT onboarded */}
        <Route element={<OnboardingRoute />}>
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route
            path="/student/onboarding"
            element={<StudentOnboardingPage />}
          />
          <Route path="/tutor/onboarding" element={<TutorOnboardingPage />} />
        </Route>

        {/* Student protected routes: require login, verified, onboarded, role = student */}
        <Route
          path="/student"
          element={
            <StudentRoute>
              <Layout sidebarLinks={studentSidebarLinks} />
            </StudentRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="library" element={<StudentLibraryPage />} />
          <Route path="tutors" element={<StudentTutorsPage />} />
          <Route
            path="tutor-profile/:id"
            element={<StudentTutorProfilePage />}
          />
          <Route
            path="chats"
            element={<RecentChatsPage key={location.pathname} />}
          />
          <Route
            path="chat/:id"
            element={<ChatPage key={location.pathname} />}
          />
          <Route
            path="call/:id"
            element={<CallPage key={location.pathname} />}
          />
          <Route path="booking/:id" element={<StudentBookingPage />} />
          <Route path="sessions" element={<StudentSessionsPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="settings" element={<AccountSettingsPage />} />
        </Route>

        {/* Tutor protected routes: require login, verified, onboarded, role = tutor */}
        <Route
          path="/tutor"
          element={
            <TutorRoute>
              <Layout sidebarLinks={tutorSidebarLinks} />
            </TutorRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TutorDashboardPage />} />
          <Route path="sessions" element={<TutorSessionsPage />} />
          <Route path="availability" element={<TutorAvailabilityPage />} />
          <Route
            path="chats"
            element={<RecentChatsPage key={location.pathname} />}
          />
          <Route
            path="chat/:id"
            element={<ChatPage key={location.pathname} />}
          />
          <Route
            path="call/:id"
            element={<CallPage key={location.pathname} />}
          />
          <Route path="settings" element={<AccountSettingsPage />} />
          <Route path="profile" element={<TutorPrivateProfilePage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="booking-requests" element={<BookingRequestsPage />} />
        </Route>

        {/* Admin protected routes: require login, verified, onboarded, role = admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout sidebarLinks={adminSidebarLinks} />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="tutors" element={<AdminTutorsPage />} />
          <Route path="tutors/:id" element={<AdminTutorsProfilePage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="students/:id" element={<AdminStudentsProfilePage />} />
          <Route path="report" element={<AdminReportsPage />} />
          <Route path="settings" element={<AccountSettingsPage />} />
          <Route path="manage-admins" element={<AdminManageAdminsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}
