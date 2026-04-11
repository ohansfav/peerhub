import Button from "./LandingButton";
import { ASSETS } from "../../config/assets";
import useAuthStatus from "../../hooks/auth/useAuthStatus";

const CTASection = () => {
  const { isAuthenticated, roleLink } = useAuthStatus();

  return (
    <section
      className="relative py-24 md:py-32"
      // style={{
      //   backgroundImage: `url(${ASSETS.cta.backgroundImage})`,
      //   backgroundSize: "cover",
      //   backgroundPosition: "center",
      //   backgroundRepeat: "no-repeat",
      // }}
    >
      <img
        src={ASSETS.cta.backgroundImage}
        alt={ASSETS.cta.alt}
        className="absolute inset-0 w-full h-full object-cover object-top z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/80 to-slate-900/70"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Level Up</span> Your Grades?
        </h2>

        <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 leading-relaxed">
          Whether you need help with a tough course or want to earn by tutoring
          others, Peerup gets you there. Join thousands of students already on
          the platform.
        </p>

        {isAuthenticated ? (
          <Button to={roleLink} variant="primary" size="md">
            Go to Dashboard
          </Button>
        ) : (
          <Button to="/signup" variant="primary" size="lg">
            Register with us today!
          </Button>
        )}
      </div>
    </section>
  );
};

export default CTASection;
