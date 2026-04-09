import Button from "./LandingButton";
import { ASSETS } from "../../config/assets";
import useAuthStatus from "../../hooks/auth/useAuthStatus";

const HeroSection = () => {
  const { isAuthenticated, roleLink } = useAuthStatus();

  return (
    <section
      id="home"
      className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center md:justify-start pt-16 md:pt-20"
    >
      <img
        src={ASSETS.hero.backgroundImage}
        alt={ASSETS.hero.alt}
        className="absolute inset-0 w-full h-full object-cover object-top z-0"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/70"></div>

      <div className="relative z-10 max-w-7xl p-6 sm:px-6 lg:px-8 text-center md:text-left mt-6 md:mt-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          <span className="text-blue-500">Peer Tutoring</span> that Bridges{" "}
          <br className="hidden md:block" />
          the Education Gap.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto md:mx-0">
          Join a movement of students and volunteers working together to make
          learning fun, and fair.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4">
          {isAuthenticated ? (
            <Button to={roleLink} variant="primary" size="md">
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button to="/signup" variant="primary" size="md">
                Join as a Student
              </Button>
              <Button to="/signup" variant="secondary" size="md">
                Become a Tutor
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
