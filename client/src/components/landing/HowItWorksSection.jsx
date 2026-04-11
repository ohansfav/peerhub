import {
  UserPlus,
  Monitor,
  Video,
  BookOpen,
  MessageCircle,
  Trophy,
} from "lucide-react";
import Section from "../common/Section";
import { HOW_IT_WORKS_STEPS } from "../../config/assets";

const iconMap = {
  UserPlus,
  Monitor,
  Video,
  BookOpen,
  MessageCircle,
  Trophy,
};

const StepCard = ({ step, isLast, isThird }) => {
  const Icon = iconMap[step.icon];

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-4 md:p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:from-blue-500 hover:to-blue-600">
        <div className="flex flex-col items-center text-center space-y-2 md:space-y-4">
          <div className="bg-white/20 rounded-full p-2 md:p-3 lg:p-4 backdrop-blur-sm">
            <Icon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
          </div>
          <h3 className="text-sm md:text-lg lg:text-xl font-bold">
            {step.title}
          </h3>
          <p className="text-xs md:text-sm lg:text-base text-blue-100">
            {step.description}
          </p>
        </div>
      </div>

      {!isLast && !isThird && (
        <div className="hidden lg:block absolute top-1/2 -right-8 xl:-right-12 transform -translate-y-1/2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 rounded-full bg-blue-200 animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      )}
    </div>
  );
};

const HowItWorksSection = () => {
  return (
    <Section id="features" background="gray">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          How <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Peerup</span> Works
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Your learning journey made simple, supportive, and powerful.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <StepCard
            key={step.id}
            step={step}
            isLast={index === HOW_IT_WORKS_STEPS.length - 1}
            isThird={(index + 1) % 3 === 0}
          />
        ))}
      </div>
    </Section>
  );
};

export default HowItWorksSection;
