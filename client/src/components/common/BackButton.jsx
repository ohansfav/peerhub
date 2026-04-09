import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ to = -1 }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full 
         border border-[#0568FF] shadow-sm 
         bg-white text-primary font-semibold 
         hover:bg-primary hover:text-white hover:border-transparent 
         transition-colors duration-200"
    >
      <ChevronLeft size={18} />
      <span className="hidden md:inline">Back</span>
    </button>
  );
};

export default BackButton;
