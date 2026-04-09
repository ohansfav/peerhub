import { Outlet } from "react-router-dom";

const MainContent = ({ children }) => {
  return (
    <main className="transition-all duration-300 ease-in-out pt-16 lg:pl-64 flex-1 min-w-0">
      <div className="px-1 py-2 md:p-6 w-full">{children || <Outlet />}</div>
    </main>
  );
};

export default MainContent;
