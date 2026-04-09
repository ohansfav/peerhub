import { useState } from "react";
import Tutor from "../../assets/images/onboarding/tutor.svg";
import Student from "../../assets/images/onboarding/student.svg";
import RoleSelectionCard from "../../components/onboarding/RoleSelectionCard";
import { useNavigate } from "react-router-dom";

const RoleSelectionPage = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    if (role === "tutor") {
      navigate("/tutor/onboarding");
    } else if (role === "student") {
      navigate("/student/onboarding");
    }
  };

  const roles = [
    {
      id: "tutor",
      role: "I'm a Tutor",
      description:
        "I want to share my expertise and coach students to succeed in crucial exams like WAEC and JAMB.",
      image: Tutor,
    },
    {
      id: "student",
      role: "I'm a Student",
      description:
        "I want to find qualified tutors to help me prepare for WAEC, JAMB and other important exams.",
      image: Student,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-2xl md:text-5xl font-bold text-gray-800 mb-2 md:mb-4">
            What would you use <span className="text-primary">Peerhub</span>{" "}
            for?
          </h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            Connecting Nigerian students with qualified tutors fro WAEC, JAMB
            and exam preparation.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-12 max-w-4xl mx-auto">
          {roles.map((roleData) => (
            <RoleSelectionCard
              key={roleData.id}
              role={roleData.role}
              description={roleData.description}
              image={roleData.image}
              onClick={() => handleRoleSelection(roleData.id)}
              isHovered={hoveredCard === roleData.id}
              onHover={() => setHoveredCard(roleData.id)}
              onLeave={() => setHoveredCard(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
