import { useState, useRef, useEffect } from "react";
import SearchBar from "../../components/common/SearchBar";
import FilterDropdown from "../../components/common/FilterDropdown";
import Spinner from "../../components/common/Spinner";
import { useTutors } from "../../hooks/tutor/useTutors";
import TutorSearchCard from "../../components/student/TutorSearchCard";
import useSubjects from "../../hooks/useSubjects";

const StudentTutorsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    subjects: [],
    availability: [],
    ratings: [],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    subjects: [],
    availability: [],
    ratings: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12); // Items per page

  const filterRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target))
        setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const { data, isLoading, error } = useTutors(
    appliedSearchQuery,
    appliedFilters,
    currentPage,
    limit
  );

  const { subjects, subjectLoading, subjectError } = useSubjects();

  const applyFilters = () => {
    setAppliedSearchQuery(searchQuery);
    setAppliedFilters(filters);
    setIsFilterOpen(false);
    setCurrentPage(1); // Reset to first page on new search/filter
  };

  const resetFilters = () => {
    setFilters({ subjects: [], availability: [], ratings: [] });
    setAppliedFilters({ subjects: [], availability: [], ratings: [] });
    setSearchQuery("");
    setAppliedSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-500">Failed to load tutors.</p>;

  const tutors = data?.data || [];
  const meta = data?.meta || { page: 1, total: 0, limit: limit, count: 0 };
  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="mx-auto px-1 sm:px-0 min-h-screen flex flex-col">
      <div className="flex items-center gap-2 md:gap-4 mb-6 relative">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={applyFilters}
        />
        <FilterDropdown
          ref={filterRef}
          filters={filters}
          appliedFilters={appliedFilters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          resetFilters={resetFilters}
          isOpen={isFilterOpen}
          setIsOpen={setIsFilterOpen}
          subjects={subjects}
          subjectLoading={subjectLoading}
          subjectError={subjectError}
        />
      </div>

      <div className="flex-grow">
        {!tutors?.length ? (
          <p className="flex justify-center items-center font-bold ">
            No tutors found.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutors.map((tutor) => (
                <TutorSearchCard
                  key={tutor.userId}
                  tutor={tutor}
                  compact={false}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 &&
                        pageNumber <= currentPage + 1);

                    // Show ellipsis
                    const showEllipsisBefore =
                      pageNumber === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter =
                      pageNumber === currentPage + 2 &&
                      currentPage < totalPages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span
                          key={pageNumber}
                          className="px-3 py-2 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          currentPage === pageNumber
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results info */}
            <p className="text-center text-gray-600 mt-4 text-sm">
              Showing {(currentPage - 1) * meta.limit + 1} -{" "}
              {Math.min(currentPage * meta.limit, meta.total)} of {meta.total}{" "}
              tutors
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentTutorsPage;
