import { useState } from "react";
import { ChevronDown, CheckCircle } from "lucide-react";
import Section from "../common/Section";
import { FAQ_ITEMS } from "../../config/assets";

const AccordionItem = ({ item, isOpen, onClick }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-4 flex-1">
          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <span className="text-lg font-semibold text-gray-900">
            {item.question}
          </span>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-blue-600 transition-transform duration-300 flex-shrink-0 ml-4 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="p-6 pt-0 pl-16 text-gray-600 leading-relaxed">
          {item.answer}
        </div>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section id="faq" background="light">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Frequently Asked <span className="text-blue-600">Questions</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Here are answers to some of the most common things students and tutors
          ask.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem
            key={item.id}
            item={item}
            isOpen={openIndex === index}
            onClick={() => toggleAccordion(index)}
          />
        ))}
      </div>
    </Section>
  );
};

export default FAQSection;
