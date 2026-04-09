const Section = ({
  children,
  id,
  className = "",
  background = "light",
  containerSize = "default",
}) => {
  const backgrounds = {
    light: "bg-white",
    gray: "bg-gray-50",
    dark: "bg-gray-900",
    blue: "bg-blue-50",
  };

  const containers = {
    default: "max-w-7xl",
    narrow: "max-w-5xl",
    wide: "max-w-screen-2xl",
    full: "max-w-full",
  };

  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${backgrounds[background]} ${className}`}
    >
      <div
        className={`${containers[containerSize]} mx-auto px-4 sm:px-6 lg:px-8`}
      >
        {children}
      </div>
    </section>
  );
};

export default Section;
