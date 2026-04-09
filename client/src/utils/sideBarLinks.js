import DashboardIcon from "../assets/images/layout-icons/home.svg?react";
import LibraryIcon from "../assets/images/layout-icons/library.svg?react";
import AskIcon from "../assets/images/layout-icons/question.svg?react";
import TutorIcon from "../assets/images/layout-icons/tutors.svg?react";
import SettingsIcon from "../assets/images/layout-icons/setting.svg?react";
import SessionIcon from "../assets/images/layout-icons/calendar.svg?react";
import AvailabilityIcon from "../assets/images/layout-icons/clock.svg?react";
import MessageIcon from "../assets/images/layout-icons/message.svg?react";
import StudentsIcon from "../assets/images/layout-icons/students.svg?react";
import ReportsIcon from "../assets/images/layout-icons/reports.svg?react";
import { UsersIcon } from "lucide-react";

export const studentSidebarLinks = [
  { path: "/student/dashboard", label: "Dashboard", icon: DashboardIcon },
  { path: "/student/sessions", label: "My Sessions", icon: SessionIcon },
  { path: "/student/library", label: "Library", icon: LibraryIcon },
  { path: "/student/tutors", label: "Tutors", icon: TutorIcon },
  { path: "/student/chats", label: "Messages", icon: MessageIcon },
  { path: "/student/faq", label: "Ask Questions", icon: AskIcon },
  { path: "/student/settings", label: "Settings", icon: SettingsIcon },
];

export const tutorSidebarLinks = [
  { path: "/tutor/dashboard", label: "Dashboard", icon: DashboardIcon },
  {
    path: "/tutor/booking-requests",
    label: "Booking Requests",
    icon: StudentsIcon,
  },

  { path: "/tutor/sessions", label: "My Sessions", icon: SessionIcon },
  {
    path: "/tutor/availability",
    label: "Availability",
    icon: AvailabilityIcon,
  },
  { path: "/tutor/chats", label: "Messages", icon: MessageIcon },
  { path: "/tutor/faq", label: "Ask Questions", icon: AskIcon },
  { path: "/tutor/settings", label: "Settings", icon: SettingsIcon },
];

export const adminSidebarLinks = [
  { path: "/admin/dashboard", label: "Dashboard", icon: DashboardIcon },
  { path: "/admin/tutors", label: "Tutors", icon: TutorIcon },
  { path: "/admin/students", label: "Students", icon: StudentsIcon },
  { path: "/admin/report", label: "Reports", icon: ReportsIcon },
  {
    path: "/admin/manage-admins",
    label: "Manage Admins",
    icon: UsersIcon,
    superAdminOnly: true,
  },
  { path: "/admin/settings", label: "Settings", icon: SettingsIcon },
];
