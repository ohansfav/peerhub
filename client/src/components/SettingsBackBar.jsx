// src/components/SettingsBackBar.jsx
import React from "react";

export default function SettingsBackBar({ title, onBack }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-full border hover:bg-gray-50 text-sm"
        aria-label="Back"
      >
        <svg
          className="w-4 h-4 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}
