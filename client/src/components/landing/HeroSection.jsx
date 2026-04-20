import Button from "./LandingButton";
import { ASSETS } from "../../config/assets";
import useAuthStatus from "../../hooks/auth/useAuthStatus";

const HeroSection = () => {
  const { isAuthenticated, roleLink } = useAuthStatus();

  return (
    <section
      id="home"
      className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center md:justify-start pt-16 md:pt-20 overflow-hidden"
    >
      <img
        src={ASSETS.hero.backgroundImage}
        alt={ASSETS.hero.alt}
        className="absolute inset-0 w-full h-full object-cover object-top z-0"
        fetchPriority="high"
        decoding="async"
        loading="eager"
        onError={(e) => {
          if (ASSETS.hero.fallbackImage) {
            e.currentTarget.src = ASSETS.hero.fallbackImage;
          }
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/80 to-slate-900/70"></div>

      {/* Decorative floating shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl p-6 sm:px-6 lg:px-8 text-center md:text-left mt-6 md:mt-20">
        <div className="inline-block px-4 py-1.5 mb-5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium">
          🎓 Peer-to-Peer Learning Platform
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Learn Better,{" "}
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Together.</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed">
          Connect with top student tutors, access course materials, and
          accelerate your academic success — all in one platform built for
          university students.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4">
          {isAuthenticated ? (
            <Button to={roleLink} variant="primary" size="md">
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button to="/signup" variant="primary" size="md">
                Get Started Free
              </Button>
              <Button to="/signup" variant="secondary" size="md">
                Become a Tutor
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center md:justify-start gap-8 mt-10 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>1000+ Active Students</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span>500+ Verified Tutors</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
