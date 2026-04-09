import { LogOut } from "lucide-react";
import DropdownItem from "./DropdownItem";
import { profileDropdownItems } from "../../utils/navBarLinks";
import { useTutorStatus } from "../../hooks/auth/useUserRoles";
import { useUserProfile } from "../../hooks/profile/useUserProfile";

const ProfileDropdown = ({ logoutMutation, closeDropdown }) => {
  const { data: user } = useUserProfile();
  const tutorStatus = useTutorStatus();

  const items = profileDropdownItems[user?.role] || [];

  const isTutorAndRestricted =
    user?.role === "tutor" &&
    (tutorStatus === "pending" || tutorStatus === "rejected");

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="text-sm text-gray-500 break-all">{user?.email}</p>
      </div>

      {/* Items */}
      <div className="py-1">
        {items
          .filter((item) => item.label !== "Sign Out")
          .map(({ label, path, icon: Icon }, index) => {
            const isDisabled = isTutorAndRestricted && label !== "Dashboard";
            return (
              <DropdownItem
                key={index}
                label={label}
                path={isDisabled ? "#" : path}
                icon={Icon}
                onClick={isDisabled ? (e) => e.preventDefault() : closeDropdown}
                disabled={isDisabled}
              />
            );
          })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-1">
        <DropdownItem
          icon={LogOut}
          label="Sign Out"
          danger
          onClick={() => {
            logoutMutation();
            closeDropdown();
          }}
        />
      </div>
    </div>
  );
};

export default ProfileDropdown;
