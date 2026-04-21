import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/landing/HomePage";
import { Toaster } from "react-hot-toast";
import PublicOnlyRoute from "./components/routes/PublicRoute";
import EmailVerificationRoute from "./components/routes/EmailVerificationRoute";
import AdminRoute from "./components/routes/AdminRoute";
import OnboardingRoute from "./components/routes/OnboardingRoute";
import Layout from "./layouts/Layout";
import PageLoader from "./components/common/PageLoader";
import {
  adminSidebarLinks,
  studentSidebarLinks,
  tutorSidebarLinks,
} from "./utils/sideBarLinks";
import StudentRoute from "./components/routes/StudentRoute";
import TutorRoute from "./components/routes/TutorRoute";

const StudentOnboardingPage = lazy(() => import("./pages/onboarding/StudentOnboardingPage"));
const TutorOnboardingPage = lazy(() => import("./pages/onboarding/TutorOnboardingPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const EmailVerificationPage = lazy(() => import("./pages/auth/EmailVerificationPage"));
const RoleSelectionPage = lazy(() => import("./pages/onboarding/RoleSelectionPage"));
const StudentDashboardPage = lazy(() => import("./pages/student/StudentDashboardPage"));
const TutorDashboardPage = lazy(() => import("./pages/tutor/TutorDashboardPage"));
const TutorCoursesPage = lazy(() => import("./pages/tutor/TutorCoursesPage"));
const NotFoundPage = lazy(() => import("./pages/general/NotFoundPage"));
const StudentLibraryPage = lazy(() => import("./pages/student/StudentLibraryPage"));
const StudentTutorsPage = lazy(() => import("./pages/student/StudentTutorsPage"));
const StudentQuizPage = lazy(() => import("./pages/student/StudentQuizPage"));
const FAQPage = lazy(() => import("./pages/general/FAQPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminManageAdminsPage = lazy(() => import("./pages/admin/AdminManageAdminsPage"));
const StudentBookingPage = lazy(() => import("./pages/student/StudentBookingPage"));
const AdminTutorsPage = lazy(() => import("./pages/admin/AdminTutorsPage"));
const TutorSessionsPage = lazy(() => import("./pages/tutor/TutorSessionsPage"));
const TutorAvailabilityPage = lazy(() => import("./pages/tutor/TutorAvailabilityPage"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage"));
const AdminStudentsPage = lazy(() => import("./pages/admin/AdminStudentsPage"));
const AdminTutorsProfilePage = lazy(() => import("./pages/admin/AdminTutorsProfilePage"));
const AdminStudentsProfilePage = lazy(() => import("./pages/admin/AdminStudentsProfilePage"));
const ChatPage = lazy(() => import("./pages/messaging/ChatPage"));
const CallPage = lazy(() => import("./pages/messaging/CallPage"));
const RecentChatsPage = lazy(() => import("./pages/messaging/RecentChatsPage"));
const OfflineLiveClassPage = lazy(() => import("./pages/messaging/OfflineLiveClassPage"));
const ClassroomChatPage = lazy(() => import("./pages/messaging/ClassroomChatPage"));
const TutorPrivateProfilePage = lazy(() => import("./pages/tutor/TutorPrivateProfilePage"));
const TutorQuizPage = lazy(() => import("./pages/tutor/TutorQuizPage"));
const BookingRequestsPage = lazy(() => import("./pages/tutor/BookingRequestsPage"));
const StudentSessionsPage = lazy(() => import("./pages/student/StudentSessionsPage"));
const StudentTutorProfilePage = lazy(() => import("./pages/student/StudentTutorProfilePage"));
const StudentCourseCatalogPage = lazy(() => import("./pages/student/StudentCourseCatalogPage"));
const StudentMyCoursesPage = lazy(() => import("./pages/student/StudentMyCoursesPage"));
const AccountSettingsPage = lazy(() => import("./pages/general/AccountSettingsPage"));
const TutorPrivateClassPage = lazy(() => import("./pages/tutor/TutorPrivateClassPage"));

export default function App() {
  const location = useLocation();
  const renderLazy = (Component, props = {}) => (
    <Suspense fallback={<PageLoader />}>
      <Component {...props} />
    </Suspense>
  );

  return (
    <>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<HomePage />} />

        {/* Public-only routes: accessible only if NOT logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/signup" element={renderLazy(SignupPage)} />
          <Route path="/login" element={renderLazy(LoginPage)} />
          <Route path="/forgot-password" element={renderLazy(ForgotPasswordPage)} />
          <Route
            path="/reset-password/:token"
            element={renderLazy(ResetPasswordPage)}
          />
        </Route>

        {/* Email verification route: accessible only if logged in and NOT verified */}
        <Route
          path="/verify-email"
          element={
            <EmailVerificationRoute>
              {renderLazy(EmailVerificationPage)}
            </EmailVerificationRoute>
          }
        />

        {/* Onboarding routes: accessible only if logged in, verified, but NOT onboarded */}
        <Route element={<OnboardingRoute />}>
          <Route path="/role-selection" element={renderLazy(RoleSelectionPage)} />
          <Route
            path="/student/onboarding"
            element={renderLazy(StudentOnboardingPage)}
          />
          <Route path="/tutor/onboarding" element={renderLazy(TutorOnboardingPage)} />
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
          <Route path="dashboard" element={renderLazy(StudentDashboardPage)} />
          <Route path="library" element={renderLazy(StudentLibraryPage)} />
          <Route path="quizzes" element={renderLazy(StudentQuizPage)} />
          <Route path="tutors" element={renderLazy(StudentTutorsPage)} />
          <Route
            path="tutor-profile/:id"
            element={renderLazy(StudentTutorProfilePage)}
          />
          <Route
            path="chats"
            element={renderLazy(RecentChatsPage, { key: location.pathname })}
          />
          <Route
            path="chat/:id"
            element={renderLazy(ChatPage, { key: location.pathname })}
          />
          <Route
            path="call/:id"
            element={renderLazy(CallPage, { key: location.pathname })}
          />
          <Route
            path="live-class/:id"
            element={renderLazy(OfflineLiveClassPage, { key: location.pathname })}
          />
          <Route
            path="classroom-chat/:id"
            element={renderLazy(ClassroomChatPage, { key: location.pathname })}
          />
          <Route path="booking/:id" element={renderLazy(StudentBookingPage)} />
          <Route path="sessions" element={renderLazy(StudentSessionsPage)} />
          <Route path="courses" element={renderLazy(StudentCourseCatalogPage)} />
          <Route path="my-courses" element={renderLazy(StudentMyCoursesPage)} />
          <Route path="faq" element={renderLazy(FAQPage)} />
          <Route path="settings" element={renderLazy(AccountSettingsPage)} />
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
          <Route path="dashboard" element={renderLazy(TutorDashboardPage)} />
          <Route path="courses" element={renderLazy(TutorCoursesPage)} />
          <Route path="virtual-classes" element={renderLazy(TutorSessionsPage)} />
          <Route path="sessions" element={renderLazy(TutorSessionsPage)} />
          <Route path="private-class" element={renderLazy(TutorPrivateClassPage)} />
          <Route path="availability" element={renderLazy(TutorAvailabilityPage)} />
          <Route path="quizzes" element={renderLazy(TutorQuizPage)} />
          <Route
            path="chats"
            element={renderLazy(RecentChatsPage, { key: location.pathname })}
          />
          <Route
            path="chat/:id"
            element={renderLazy(ChatPage, { key: location.pathname })}
          />
          <Route
            path="call/:id"
            element={renderLazy(CallPage, { key: location.pathname })}
          />
          <Route
            path="live-class/:id"
            element={renderLazy(OfflineLiveClassPage, { key: location.pathname })}
          />
          <Route
            path="classroom-chat/:id"
            element={renderLazy(ClassroomChatPage, { key: location.pathname })}
          />
          <Route path="settings" element={renderLazy(AccountSettingsPage)} />
          <Route path="profile" element={renderLazy(TutorPrivateProfilePage)} />
          <Route path="faq" element={renderLazy(FAQPage)} />
          <Route path="booking-requests" element={renderLazy(BookingRequestsPage)} />
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
          <Route path="dashboard" element={renderLazy(AdminDashboardPage)} />
          <Route path="tutors" element={renderLazy(AdminTutorsPage)} />
          <Route path="tutors/:id" element={renderLazy(AdminTutorsProfilePage)} />
          <Route path="students" element={renderLazy(AdminStudentsPage)} />
          <Route path="students/:id" element={renderLazy(AdminStudentsProfilePage)} />
          <Route path="report" element={renderLazy(AdminReportsPage)} />
          <Route path="settings" element={renderLazy(AccountSettingsPage)} />
          <Route path="manage-admins" element={renderLazy(AdminManageAdminsPage)} />
        </Route>
        <Route path="*" element={renderLazy(NotFoundPage)} />
      </Routes>
      <Toaster />
    </>
  );
}
