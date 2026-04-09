import { ASSETS } from "../../config/assets";
import Section from "../common/Section";

const AboutSection = () => {
  return (
    <Section id="about" background="light">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto">
            <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
            <img
              src={ASSETS.about.studentImage}
              alt={ASSETS.about.alt}
              className="absolute inset-0 w-full h-full object-cover rounded-full border-8 border-white shadow-xl"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-600">Peerhub</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-700 mb-4 leading-relaxed">
            Every student deserves quality education, no matter their location
            or income.
          </p>

          <p className="text-base md:text-lg text-gray-600 mb-4 leading-relaxed">
            Peerhub is a peer-to-peer platform that connects Nigerian
            secondary school students with volunteer tutors to provide free,
            personalized academic support and mentorship.
          </p>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            By leveraging the power of community and technology, we're breaking
            down barriers to education and empowering the next generation of
            leaders, innovators, and change-makers in underserved communities.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-sm text-gray-600">Active Students</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">Volunteer Tutors</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default AboutSection;
