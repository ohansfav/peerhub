import React, { useState, useEffect } from "react";
import { ChevronLeft, BookOpen, FileText, HelpCircle, Download, Search } from "lucide-react";
import { getSubjects } from "../../lib/api/common/subjectsApi";

const RESOURCE_TYPES = [
  { key: "notes", label: "Lecture Notes", icon: FileText, color: "bg-blue-100 text-blue-600" },
  { key: "pastQuestions", label: "Past Questions", icon: HelpCircle, color: "bg-yellow-100 text-yellow-700" },
  { key: "studyGuides", label: "Study Guides", icon: BookOpen, color: "bg-teal-100 text-teal-700" },
  { key: "materials", label: "Course Materials", icon: Download, color: "bg-purple-100 text-purple-700" },
];

const StudentLibraryPage = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const subjects = await getSubjects();
        setCourses(subjects || []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCourse) {
    return (
      <CourseResourcesPage
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Library</h1>
        <p className="text-gray-500 mt-1">
          Browse course materials, lecture notes, past questions, and study resources.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {course.name}
              </h3>
              {course.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {course.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  4 resource types
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
};

export default StudentLibraryPage;

const CourseResourcesPage = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState("notes");

  return (
    <div className="space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-blue-500 shadow-sm bg-white text-blue-600 font-semibold hover:bg-blue-600 hover:text-white hover:border-transparent transition-colors duration-200"
        >
          <ChevronLeft size={18} />
          <span className="hidden md:inline">Back</span>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{course.name}</h1>
          {course.description && (
            <p className="text-sm text-gray-500">{course.description}</p>
          )}
        </div>
      </div>

      {/* Resource Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {RESOURCE_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.key}
              onClick={() => setActiveTab(type.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === type.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="bg-white border rounded-xl p-6 min-h-[300px]">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            {activeTab === "notes" && <FileText className="w-8 h-8 text-blue-500" />}
            {activeTab === "pastQuestions" && <HelpCircle className="w-8 h-8 text-yellow-600" />}
            {activeTab === "studyGuides" && <BookOpen className="w-8 h-8 text-teal-600" />}
            {activeTab === "materials" && <Download className="w-8 h-8 text-purple-600" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-700">
            {RESOURCE_TYPES.find((t) => t.key === activeTab)?.label}
          </h3>
          <p className="text-gray-400 mt-2 max-w-sm">
            {activeTab === "notes" && `Lecture notes for ${course.name} will be uploaded by tutors and instructors.`}
            {activeTab === "pastQuestions" && `Past exam questions and answers for ${course.name} will appear here.`}
            {activeTab === "studyGuides" && `Study guides and summaries for ${course.name} topics will be available here.`}
            {activeTab === "materials" && `Downloadable course materials, slides, and handouts for ${course.name}.`}
          </p>
          <span className="inline-block mt-4 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            No resources uploaded yet — Check back later
          </span>
        </div>
      </div>
    </div>
  );
};
