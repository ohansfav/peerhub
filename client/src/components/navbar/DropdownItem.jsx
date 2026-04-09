import { NavLink } from "react-router-dom";

const DropdownItem = ({ icon: Icon, label, path, danger, onClick }) => {
  const baseClasses = `flex items-center w-full px-4 py-2 text-sm transition-colors ${
    danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-200"
  }`;

  if (!path) {
    return (
      <button type="button" onClick={onClick} className={baseClasses}>
        <Icon className="h-4 w-4 mr-3" />
        {label}
      </button>
    );
  }

  return (
    <NavLink
      to={path}
      className={baseClasses}
      onClick={() => {
        if (onClick) onClick(); // just close dropdown, navigation happens naturally
      }}
    >
      <Icon className="h-4 w-4 mr-3" />
      {label}
    </NavLink>
  );
};

export default DropdownItem;
