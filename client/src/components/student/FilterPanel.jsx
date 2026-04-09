import { X } from "lucide-react";
import React, { useState } from "react";

const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  allSubjects,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSubjectToggle = (subject) => {
    setLocalFilters((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      subjects: [],
      minRating: 0,
      maxPrice: 100,
      availability: "all",
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-lg">Filters</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="space-y-6">
            {/* Subjects */}
            <div>
              <h4 className="font-medium mb-3">Subjects</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allSubjects.map((subject) => (
                  <label key={subject} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={localFilters.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="font-medium mb-3">Minimum Rating</h4>
              <select
                value={localFilters.minRating}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    minRating: Number(e.target.value),
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-medium mb-3">Max Price per Hour</h4>
              <input
                type="range"
                min="20"
                max="100"
                value={localFilters.maxPrice}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    maxPrice: Number(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>$20</span>
                <span>${localFilters.maxPrice}</span>
                <span>$100+</span>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h4 className="font-medium mb-3">Availability</h4>
              <select
                value={localFilters.availability}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    availability: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Tutors</option>
                <option value="available">Available Now</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleClearFilters}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-focus"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
