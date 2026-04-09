import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import Mathematics from "../../assets/images/mathematics.jpg";
import English from "../../assets/images/english.jpg";
import Chemistry from "../../assets/images/chemistry.jpg";
import Biology from "../../assets/images/biology.jpg";
import Physics from "../../assets/images/physics.jpg";
import Literature from "../../assets/images/english-literature.jpg";

const subjects = [
  { name: "Mathematics", image: Mathematics },
  { name: "English Language", image: Literature },
  { name: "Biology", image: Biology },
  { name: "Chemistry", image: Biology },
  { name: "Physics", image: Physics },
  { name: "English Literature", image: Literature },
];

const StudentLibraryPage = () => {
  const [eachsubject, setEachSubject] = useState(null);

  if (eachsubject) {
    return (
      <StudentSubjectPage subject={eachsubject} setSubject={setEachSubject} />
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="flex flex-wrap justify-center gap-3 cursor-pointer">
        {subjects.map((subj) => (
          <div
            key={subj.name}
            className="card w-72 shadow-sm bg-gray-300 rounded-xl overflow-hidden transition transform hover:shadow-md hover:-translate-y-1 cursor-pointer"
            onClick={() => setEachSubject(subj)}
          >
            <img
              src={subj.image}
              alt={subj.name}
              className="rounded-t-xl h-48 w-full object-cover"
            />
            <div className="p-3 text-center">
              <p className="font-medium text-gray-700">{subj.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentLibraryPage;

const StudentSubjectPage = ({ subject, setSubject }) => {
  const handleBack = () => {
    setSubject(null);
  };
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full 
                  border border-[#0568FF] shadow-sm 
                  bg-white text-primary font-semibold 
                  hover:bg-primary hover:text-white hover:border-transparent 
                  transition-colors duration-200"
        >
          <ChevronLeft size={18} />
          <span className="hidden md:inline">Back</span>
        </button>

        {/* <p className="font-bold text-lg mx-auto text-center">{subject.name}</p> */}
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-gray-100 p-8 rounded-xl shadow-sm max-w-md">
          <p className="text-xl font-semibold text-gray-700">
            📚 Content Coming Soon
          </p>
          <p className="text-gray-500 mt-2">
            Check back later for{" "}
            <span className="font-medium">{subject.name}</span> resources.
          </p>
        </div>
      </div>
    </>
  );
};
