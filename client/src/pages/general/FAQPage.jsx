import React, { useState, useMemo } from "react";

import handWaving from "../../assets/Faq/hand-waving.svg";
import dropDown from "../../assets/Faq/drop-down.svg";
import chatDots from "../../assets/Faq/chat-dots.svg";
import { useAuth } from "../../hooks/useAuthContext";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const { authUser } = useAuth();

  const FAQ_ITEMS = [
    // --- GENERAL FAQs (visible to everyone) ---
    {
      id: 1,
      question: "What courses are covered?",
      answer:
        "Peerup covers a wide range of university courses including Computer Science, Mathematics, Physics, Chemistry, Biology, Accounting, Economics, Engineering, Law, Mass Communication, and more.",
      roles: ["all"],
    },
    {
      id: 2,
      question: "Is Peerup free to use?",
      answer:
        "Peerup offers both free and premium features. Students can access the course resource library and ask questions in the community forum for free. Live one-on-one tutoring sessions are available through affordable plans designed for university students.",
      roles: ["all"],
    },
    {
      id: 3,
      question: "What are Peerup's goals?",
      answer:
        "Peerup's mission is to make peer-to-peer learning accessible, flexible, and personalized for every university student.",
      roles: ["all"],
    },

    // --- STUDENT-SPECIFIC FAQs ---
    {
      id: 4,
      question: "Who are the Tutors?",
      answer:
        "Our tutors are fellow university students who have excelled in their courses. Each tutor goes through a verification process including credential checks and academic performance review to ensure quality peer tutoring.",
      roles: ["student"],
    },
    {
      id: 5,
      question: "Are The Peerup Tutors Qualified?",
      answer:
        "All Peerup tutors are carefully vetted and verified students who excel in their respective fields, ensuring the best learning experience.",
      roles: ["student"],
    },
    {
      id: 6,
      question: "Can I Reschedule A Booking?",
      answer:
        "Yes, you can message your tutor directly to request a reschedule. Please do this at least 24 hours before the session begins.",
      roles: ["student"],
    },
    {
      id: 7,
      question: "What Is A Rate?",
      answer:
        "A rate refers to the amount you pay per tutoring session. This can vary depending on the tutor's expertise and course.",
      roles: ["student"],
    },

    // --- TUTOR-SPECIFIC FAQs ---
    {
      id: 8,
      question: "How do I become a Tutor?",
      answer:
        "Any university student can become a tutor on Peerup! Apply through the platform by selecting the courses you excel in, sharing your academic background, and uploading your student ID or credentials. Once verified, you can start tutoring.",
      roles: ["tutor"],
    },
    {
      id: 9,
      question: "How Do I Manage My Schedule?",
      answer:
        "Tutors can manage their availability and upcoming sessions through the dashboard. Students can view their booked sessions and reschedule if necessary.",
      roles: ["tutor"],
    },
  ];

  const faqs = useMemo(() => {
    const userRole = authUser?.role?.toLowerCase();
    return FAQ_ITEMS.filter(
      (faq) => faq.roles.includes("all") || faq.roles.includes(userRole)
    );
  }, [authUser]);

  return (
    <div className="p-2 sm:p-0 relative">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col justify-start mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-3">
            <span className="bg-primary bg-clip-text text-transparent">
              Hello {authUser.firstName}!
            </span>
            <img src={handWaving} alt="wave" className="w-7 h-7" />
          </h2>
          <p className="text-gray-600 text-lg font-medium">
            How can we help you today?
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="group border border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center px-4 py-4 text-left text-gray-800 font-semibold hover:bg-blue-50/50 transition-colors duration-200"
              >
                <span className="text-base leading-normal pr-3">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  <img
                    src={dropDown}
                    alt="toggle"
                    className={`w-5 h-5 transform transition-all duration-300 ${
                      openIndex === index
                        ? "rotate-180 text-blue-600"
                        : "group-hover:scale-110"
                    }`}
                  />
                </div>
              </button>

              {openIndex === index && (
                <div className="px-4 pb-4 text-gray-600 text-sm leading-normal animate-fadeIn border-t border-gray-100">
                  <div className="pt-3">{faq.answer}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Button */}
      <button className="fixed bottom-6 right-2 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full shadow-xl p-3 sm:p-2 hover:from-blue-700 hover:to-blue-800 hover:scale-105 transition-all duration-300 group">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
          <img
            src={chatDots}
            alt="chat"
            className="w-6 h-6 text-white filter brightness-0 invert"
          />
        </div>
        <span className="hidden text-white font-medium text-sm">
          Start up a chat with our team of experts!
        </span>
      </button>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
