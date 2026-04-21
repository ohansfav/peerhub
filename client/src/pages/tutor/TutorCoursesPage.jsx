import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "../../components/common/Spinner";
import ErrorAlert from "../../components/common/ErrorAlert";
import {
  deleteTutorUploadedCourse,
  getTutorUploadedCourses,
  uploadTutorCourse,
} from "../../lib/api/course/courseApi";
import {
  handleToastError,
  handleToastSuccess,
} from "../../utils/toastDisplayHandler";
import { BookOpen, FileText, Trash2, Upload } from "lucide-react";

const LEVELS = ["100", "200", "300", "400"];
const SEMESTERS = [
  { value: "first", label: "1st Semester" },
  { value: "second", label: "2nd Semester" },
];

const initialForm = {
  courseCode: "",
  title: "",
  description: "",
  creditUnits: 3,
  level: "100",
  semester: "first",
  materialFile: null,
};

export default function TutorCoursesPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initialForm);

  const {
    data: uploadedCourses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tutorUploadedCourses"],
    queryFn: getTutorUploadedCourses,
  });

  const createMutation = useMutation({
    mutationFn: uploadTutorCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorUploadedCourses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setForm(initialForm);
      handleToastSuccess("Course uploaded successfully.");
    },
    onError: (err) => {
      handleToastError(err, "Could not upload course.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTutorUploadedCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorUploadedCourses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      handleToastSuccess("Course deleted successfully.");
    },
    onError: (err) => {
      handleToastError(err, "Could not delete course.");
    },
  });

  const canSubmit = useMemo(() => {
    return (
      form.courseCode.trim().length > 1 &&
      form.title.trim().length > 2 &&
      !!form.level &&
      !!form.semester
    );
  }, [form]);

  const onSubmit = (event) => {
    event.preventDefault();

    if (!canSubmit) {
      handleToastError(null, "Please complete all required course fields.");
      return;
    }

    createMutation.mutate({
      ...form,
      courseCode: form.courseCode.trim().toUpperCase(),
      title: form.title.trim(),
      description: form.description.trim(),
      creditUnits: Number(form.creditUnits) || 3,
    });
  };

  return (
    <div className="space-y-6 w-full max-w-[420px] sm:max-w-xl md:max-w-6xl mx-auto p-2 sm:p-0">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-blue-600" />
          My Courses
        </h1>
        <p className="text-gray-500 mt-1">
          Upload and manage the courses you teach.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl border shadow-sm p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-lg">Upload New Course</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.courseCode}
            onChange={(e) => setForm((prev) => ({ ...prev, courseCode: e.target.value }))}
            placeholder="Course Code (e.g. CSC301)"
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Course Title"
            className="border rounded-lg px-3 py-2 text-sm"
            required
          />

          <select
            value={form.level}
            onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level} Level
              </option>
            ))}
          </select>

          <select
            value={form.semester}
            onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {SEMESTERS.map((semester) => (
              <option key={semester.value} value={semester.value}>
                {semester.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            max={12}
            value={form.creditUnits}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                creditUnits: e.target.value,
              }))
            }
            placeholder="Credit Units"
            className="border rounded-lg px-3 py-2 text-sm"
          />

          <input
            type="file"
            accept=".pdf,image/png,image/jpeg"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                materialFile: e.target.files?.[0] || null,
              }))
            }
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Course Description"
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={createMutation.isPending || !canSubmit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {createMutation.isPending ? "Uploading..." : "Upload Course"}
        </button>
      </form>

      <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-lg mb-4">Uploaded Courses</h2>

        {isLoading ? (
          <div className="py-10 flex items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <ErrorAlert error={error} />
        ) : uploadedCourses.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No uploaded courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedCourses.map((course) => (
              <div key={course.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-blue-700 font-semibold text-sm">{course.courseCode}</p>
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(course.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                    aria-label={`Delete ${course.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">{course.description || "No description"}</p>

                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span>{course.level}L</span>
                  <span>•</span>
                  <span className="capitalize">{course.semester} semester</span>
                  <span>•</span>
                  <span>{course.creditUnits} units</span>
                </div>

                {course.materialUrl ? (
                  <a
                    href={course.materialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="w-4 h-4" />
                    {course.materialName || "View uploaded material"}
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
