import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourses, getMyCourses, registerCourse } from "../../lib/api/course/courseApi";
import Spinner from "../../components/common/Spinner";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { BookOpen, Search, Filter, CheckCircle, Plus } from "lucide-react";

const LEVELS = ["100", "200", "300", "400"];
const SEMESTERS = [
  { value: "first", label: "1st Semester" },
  { value: "second", label: "2nd Semester" },
];

const StudentCourseCatalogPage = () => {
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch all courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", { level: selectedLevel, semester: selectedSemester, search, page }],
    queryFn: () =>
      getCourses({
        level: selectedLevel || undefined,
        semester: selectedSemester || undefined,
        search: search || undefined,
        page,
        limit: 12,
      }),
    keepPreviousData: true,
  });

  // Fetch registered courses to know which are already registered
  const { data: myCourses = [] } = useQuery({
    queryKey: ["myCourses"],
    queryFn: getMyCourses,
  });

  const registeredIds = new Set(myCourses.map((c) => c.id));

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerCourse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
      handleToastSuccess(`Registered for ${data.courseCode} successfully!`);
    },
    onError: (err) => {
      handleToastError(err, "Failed to register for course.");
    },
  });

  const courses = coursesData?.data || [];
  const meta = coursesData?.meta || {};

  const getLevelBadgeColor = (level) => {
    const colors = {
      "100": "bg-green-100 text-green-700",
      "200": "bg-blue-100 text-blue-700",
      "300": "bg-purple-100 text-purple-700",
      "400": "bg-red-100 text-red-700",
    };
    return colors[level] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6 w-full max-w-[420px] sm:max-w-xl md:max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-blue-600" />
          Course Catalog
        </h1>
        <p className="text-gray-500 mt-1">
          Browse and register for computing courses
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border shadow p-4 space-y-4">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-sm">Filters</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course code or title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => {
              setSelectedLevel(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level} Level
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              setPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {coursesLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner />
          <p className="text-gray-500 mt-2">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No courses found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const isRegistered = registeredIds.has(course.id);
              return (
                <div
                  key={course.id}
                  className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col ${
                    isRegistered ? "border-green-300 bg-green-50/30" : ""
                  }`}
                >
                  {/* Course Code & Level Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-700 text-sm tracking-wide">
                      {course.courseCode}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelBadgeColor(
                        course.level
                      )}`}
                    >
                      {course.level}L
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-800 mb-1 leading-tight">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    <span>{course.creditUnits} Credit Units</span>
                    <span>•</span>
                    <span className="capitalize">{course.semester} Semester</span>
                  </div>

                  {/* Register Button */}
                  {isRegistered ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Registered
                    </button>
                  ) : (
                    <button
                      onClick={() => registerMutation.mutate(course.id)}
                      disabled={registerMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      Register
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentCourseCatalogPage;
