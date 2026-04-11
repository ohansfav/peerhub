import { ASSETS } from "../../config/assets";
import Section from "../common/Section";

const AboutSection = () => {
  return (
    <Section id="about" background="light">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-100 rounded-full animate-pulse"></div>
            <img
              src={ASSETS.about.studentImage}
              alt={ASSETS.about.alt}
              className="absolute inset-0 w-full h-full object-cover rounded-full border-8 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Peerup</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-700 mb-4 leading-relaxed">
            Peerup is a peer-to-peer learning platform that connects university
            students with talented tutors from their own institutions.
          </p>

          <p className="text-base md:text-lg text-gray-600 mb-4 leading-relaxed">
            We make it easy to find help with any course — from Calculus to
            Constitutional Law. Book sessions, access course materials, and
            track your progress all in one place.
          </p>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            By leveraging technology and community-driven peer tutoring, Peerup
            is empowering the next generation of graduates, professionals, and
            leaders.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-100 shadow-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">1000+</div>
              <div className="text-sm text-gray-600 font-medium">Active Students</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-100 shadow-sm">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-sm text-gray-600 font-medium">Verified Tutors</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default AboutSection;
