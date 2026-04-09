import LandingLayout from "../../layouts/LandingLayout";
import HeroSection from "../../components/landing/HeroSection";
import HowItWorksSection from "../../components/landing/HowItWorksSection";
import AboutSection from "../../components/landing/AboutSection";
import TestimonialsSection from "../../components/landing/TestimonialsSection";
import FAQSection from "../../components/landing/FAQSection";
import CTASection from "../../components/landing/CTASection";

const LandingPage = () => {
  return (
    <LandingLayout>
      <HeroSection />
      <HowItWorksSection />
      <AboutSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </LandingLayout>
  );
};

export default LandingPage;
