import React from "react";
import { ChevronDown } from "lucide-react";

const StatCard = ({ title, value, isCompact }) => (
  <div className="bg-white border rounded-lg p-3 sm:p-4">
    <div className="text-lg sm:text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
      <span className={isCompact ? "" : "sm:hidden"}>{title}</span>
      {/* <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" /> */}
    </div>
  </div>
);

const SessionStats = ({ stats, isCompact = false }) => {
  return (
    <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          isCompact={isCompact}
        />
      ))}
    </div>
  );
};

export default SessionStats;
