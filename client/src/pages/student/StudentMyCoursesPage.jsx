import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyCourses, dropCourse } from "../../lib/api/course/courseApi";
import Spinner from "../../components/common/Spinner";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { BookOpen, Trash2, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const StudentMyCoursesPage = () => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const queryClient = useQueryClient();

  const {
    data: courses = [],
    isLoading,
  } = useQuery({
    queryKey: ["myCourses"],
    queryFn: getMyCourses,
  });

  const dropMutation = useMutation({
    mutationFn: dropCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      handleToastSuccess("Course dropped successfully.");
    },
    onError: (err) => {
      handleToastError(err, "Failed to drop course.");
    },
  });

  const handleDrop = (course) => {
    if (window.confirm(`Are you sure you want to drop ${course.courseCode} - ${course.title}?`)) {
      dropMutation.mutate(course.id);
    }
  };

  // Group courses by level
  const filteredCourses = selectedLevel
    ? courses.filter((c) => c.level === selectedLevel)
    : courses;

  const groupedByLevel = filteredCourses.reduce((acc, course) => {
    const lvl = `${course.level} Level`;
    if (!acc[lvl]) acc[lvl] = [];
    acc[lvl].push(course);
    return acc;
  }, {});

  const totalCredits = courses.reduce((sum, c) => sum + c.creditUnits, 0);
  const levels = [...new Set(courses.map((c) => c.level))].sort();

  const getLevelColor = (level) => {
    const colors = {
      "100 Level": "border-l-green-500",
      "200 Level": "border-l-blue-500",
      "300 Level": "border-l-purple-500",
      "400 Level": "border-l-red-500",
    };
    return colors[level] || "border-l-gray-500";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner />
        <p className="text-gray-500 mt-2">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[420px] sm:max-w-xl md:max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            My Courses
          </h1>
          <p className="text-gray-500 mt-1">
            Your registered courses for the current session
          </p>
        </div>
        <Link
          to="/student/courses"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors self-start"
        >
          <BookOpen className="w-4 h-4" />
          Browse Courses
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Courses</p>
        </div>
        <div className="bg-white rounded-lg border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalCredits}</p>
          <p className="text-xs text-gray-500 mt-1">Credit Units</p>
        </div>
        <div className="bg-white rounded-lg border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{levels.length}</p>
          <p className="text-xs text-gray-500 mt-1">Levels</p>
        </div>
        <div className="bg-white rounded-lg border shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {new Set(courses.map((c) => c.semester)).size}
          </p>
          <p className="text-xs text-gray-500 mt-1">Semesters</p>
        </div>
      </div>

      {/* Level filter tabs */}
      {levels.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedLevel("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedLevel === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedLevel === level
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {level} Level
            </button>
          ))}
        </div>
      )}

      {/* Course List */}
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">
            No courses registered yet
          </h3>
          <p className="text-gray-400 mt-1 mb-4">
            Browse the course catalog to register for courses
          </p>
          <Link
            to="/student/courses"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Browse Courses
          </Link>
        </div>
      ) : (
        Object.entries(groupedByLevel)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([level, levelCourses]) => (
            <div key={level}>
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                {level}
              </h2>
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">Code</div>
                  <div className="col-span-4">Course Title</div>
                  <div className="col-span-2">Semester</div>
                  <div className="col-span-2">Credits</div>
                  <div className="col-span-2">Action</div>
                </div>
                {levelCourses
                  .sort((a, b) => a.courseCode.localeCompare(b.courseCode))
                  .map((course) => (
                    <div
                      key={course.id}
                      className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 border-t border-l-4 ${getLevelColor(
                        level
                      )} hover:bg-gray-50 transition-colors`}
                    >
                      <div className="sm:col-span-2">
                        <span className="font-bold text-blue-700 text-sm">
                          {course.courseCode}
                        </span>
                      </div>
                      <div className="sm:col-span-4">
                        <p className="font-medium text-gray-800 text-sm">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 sm:hidden">
                          {course.description}
                        </p>
                      </div>
                      <div className="sm:col-span-2 flex items-center">
                        <span className="text-sm text-gray-600 capitalize">
                          {course.semester} Semester
                        </span>
                      </div>
                      <div className="sm:col-span-2 flex items-center">
                        <span className="text-sm text-gray-600">
                          {course.creditUnits} Units
                        </span>
                      </div>
                      <div className="sm:col-span-2 flex items-center">
                        <button
                          onClick={() => handleDrop(course)}
                          disabled={dropMutation.isPending}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Drop
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
};

export default StudentMyCoursesPage;
