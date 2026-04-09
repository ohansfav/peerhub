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
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 to-gray-900/60"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Start Your Learning Journey Today
        </h2>

        <p className="text-lg md:text-xl text-gray-200 mb-8 md:mb-12 leading-relaxed">
          Whether you're a student seeking academic support or a tutor eager to
          share your expertise, Peerhub offers a platform for growth and
          collaboration.
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
