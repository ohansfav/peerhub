import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
  Shield,
} from "lucide-react";

export const profileDropdownItems = {
  student: [
    // { label: "View Profile", path: "/student/profile", icon: User },
    { label: "Account Settings", path: "/student/settings", icon: Settings },
    { label: "Help & Support", path: "/student/faq", icon: HelpCircle },
    { label: "Sign Out", path: "/logout", icon: LogOut, danger: true },
  ],
  tutor: [
    { label: "View Profile", path: "/tutor/profile", icon: User },
    { label: "Account Settings", path: "/tutor/settings", icon: Settings },
    { label: "Help & Support", path: "/tutor/faq", icon: HelpCircle },
    { label: "Sign Out", path: "/logout", icon: LogOut, danger: true },
  ],
  admin: [
    // { label: "View Profile", path: "/admin/profile", icon: User },
    { label: "Account Settings", path: "/admin/settings", icon: Settings },
    { label: "Sign Out", path: "/logout", icon: LogOut, danger: true },
  ],
};
