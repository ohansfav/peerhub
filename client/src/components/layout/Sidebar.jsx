import { Link, NavLink, useLocation } from "react-router-dom";
import LogoutIcon from "../../assets/images/layout-icons/logout.svg?react";
import Logo from "../../assets/logo/PeerubLogo.svg?react";
import useLogout from "../../hooks/auth/useLogout";
import { useAuth } from "../../hooks/useAuthContext";
import { useIsSuperAdmin, useTutorStatus } from "../../hooks/auth/useUserRoles";
import LogoutPageLoader from "../ui/LogoutPageLoader";

const Sidebar = ({ isOpen, onClose, links = [] }) => {
  const { logoutMutation, isPending } = useLogout();
  const { authUser } = useAuth();
  const location = useLocation();

  const tutorStatus = useTutorStatus();
  const isSuperAdmin = useIsSuperAdmin();

  const sidebarLinks = links.filter(
    (link) => !link.superAdminOnly || isSuperAdmin
  );

  const topLevelLinks = sidebarLinks.filter((link) => !link.parentPath);
  const childLinksByParent = sidebarLinks.reduce((acc, link) => {
    if (!link.parentPath) {
      return acc;
    }

    if (!acc[link.parentPath]) {
      acc[link.parentPath] = [];
    }
    acc[link.parentPath].push(link);
    return acc;
  }, {});

  const isTutorAndRestricted =
    authUser?.role === "tutor" &&
    (tutorStatus === "pending" || tutorStatus === "rejected");

  const baseClasses =
    "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200";
  const childClasses =
    "flex items-center w-full gap-2 px-3 py-2 rounded-lg transition-colors duration-200";

  const handleLinkClick = (e, label) => {
    if (isTutorAndRestricted && label !== "Dashboard") {
      e.preventDefault();
      return;
    }
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isPending && <LogoutPageLoader />}

      {/* Mobile Overlay - Dark background when sidebar is open */}
      {/* Only shows on mobile (lg:hidden) when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
        fixed top-0 left-0 z-40 
    w-[75%] md:w-64 h-full 
        bg-white text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0    
        border-r-2 border-[#D5D8DA]   
        flex flex-col
      `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center gap-3 p-5 ">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="hidden md:block size-10" />
            <h1 className="hidden md:block text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Peerup
            </h1>
          </Link>

          {/* Close button - only visible on mobile */}
          <button
            onClick={onClose}
            className="md:hidden ml-auto p-2 rounded-md text-gray-100 hover:text-white bg-gray-400 transition-colors "
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-4 md:space-y-4 mt-1 overflow-y-auto">
          {topLevelLinks.map(({ path, label, icon: Icon }) => {
            const isDisabled = isTutorAndRestricted && label !== "Dashboard";
            const childLinks = childLinksByParent[path] || [];
            const hasActiveChild = childLinks.some(
              (child) => location.pathname === child.path
            );

            return (
              <div key={path} className="space-y-1">
                <NavLink
                  to={isDisabled ? "#" : path}
                  onClick={(e) => handleLinkClick(e, label)}
                  className={({ isActive }) =>
                    `${baseClasses} ${
                      (isActive || hasActiveChild) && !isDisabled
                        ? " text-[#0568FF] bg-[#CDE1FF]"
                        : isDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-[#2C3A47] hover:text-[#0568FF] hover:bg-[#CDE1FF]"
                    }`
                  }
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    {Icon && (
                      <Icon
                        className="h-5 w-5 opacity-70"
                        style={{
                          fill: "currentColor",
                          stroke: "currentColor",
                        }}
                      />
                    )}
                  </span>
                  <span className="truncate text-sm font-medium leading-5 whitespace-nowrap">
                    {label}
                  </span>
                </NavLink>

                {childLinks.length > 0 && (
                  <div className="ml-8 space-y-1 border-l border-slate-200 pl-2">
                    {childLinks.map(({ path: childPath, label: childLabel, icon: ChildIcon }) => {
                      const childDisabled =
                        isTutorAndRestricted && childLabel !== "Dashboard";

                      return (
                        <NavLink
                          key={childPath}
                          to={childDisabled ? "#" : childPath}
                          onClick={(e) => handleLinkClick(e, childLabel)}
                          className={({ isActive }) =>
                            `${childClasses} ${
                              isActive && !childDisabled
                                ? " text-[#0568FF] bg-[#CDE1FF]"
                                : childDisabled
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-[#2C3A47] hover:text-[#0568FF] hover:bg-[#CDE1FF]"
                            }`
                          }
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                            {ChildIcon ? (
                              <ChildIcon
                                className="h-4 w-4 opacity-70"
                                style={{
                                  fill: "currentColor",
                                  stroke: "currentColor",
                                }}
                              />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                            )}
                          </span>
                          <span className="truncate text-sm font-medium leading-5 whitespace-nowrap">
                            {childLabel}
                          </span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4">
          <button
            className="flex w-full justify-center items-center gap-3 text-[#0568FF]  border border-[#0568FF] rounded-full p-3"
            onClick={logoutMutation}
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
