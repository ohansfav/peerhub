import ImageSlider from "../components/auth/ImageSlider";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-row min-h-screen w-full overflow-hidden">
      {/* Left: Image slide */}
      <div className="relative hidden md:flex w-[45%] min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <ImageSlider />
        </div>
      </div>

      {/* Right: Dynamic Page Content */}
      <div className="w-full md:w-[55%] flex items-center justify-center p-6 md:p-4">
        <div className="w-full max-w-md ">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
