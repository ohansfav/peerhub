import { useState, useEffect, useCallback } from "react";
import dropdownIcon from "../assets/Calendar-icon/chevron-down.svg";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatDate = (date, format) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const shortMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // if (format === "yyyy-MM-dd") {
  //   const year = date.getUTCFullYear();
  //   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  //   const day = String(date.getUTCDate()).padStart(2, "0");
  //   return `${year}-${month}-${day}`;
  // }
  // if (format === "yyyy-MM") {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   return `${year}-${month}`;
  // }
  if (format === "yyyy-MM-dd") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (format === "yyyy-MM") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }
  if (format === "MMMM yyyy") {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
  if (format === "MMM") {
    return shortMonths[date.getMonth()];
  }
  // return date.toString();
  return date.toISOString(); // only when you need to send to backend
};

const startOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const daysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const addMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const addDays = (date, days) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const Calendar = ({
  bookingDates = [],
  compact = true,
  onMonthChange,
  onDateClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Memoize the formatted month to prevent unnecessary re-renders
  const currentMonthString = formatDate(currentMonth, "yyyy-MM");

  // Use useCallback to prevent function recreation on every render
  const handleMonthChangeCallback = useCallback(
    (monthString) => {
      if (onMonthChange) {
        onMonthChange(monthString);
      }
    },
    [onMonthChange]
  );

  // Only call onMonthChange when the month actually changes
  useEffect(() => {
    handleMonthChangeCallback(currentMonthString);
  }, [currentMonthString, handleMonthChangeCallback]);

  const today = formatDate(new Date(), "yyyy-MM-dd");

  // Build days grid
  const monthStart = startOfMonth(currentMonth);
  const startDay = (monthStart.getDay() + 6) % 7; // shift so week starts Monday
  const daysInCurrentMonth = daysInMonth(currentMonth);
  const days = [];

  // Previous month's trailing days
  const prevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1
  );
  const prevMonthDays = daysInMonth(prevMonth);
  for (let i = startDay; i > 0; i--) {
    days.push({
      date: new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        prevMonthDays - i + 1
      ),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    days.push({
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
      isCurrentMonth: true,
    });
  }

  // Next month's leading days
  const nextMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1
  );
  let nextDay = 1;
  while (days.length < 42) {
    days.push({
      date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextDay),
      isCurrentMonth: false,
    });
    nextDay++;
  }

  const handleDayClick = useCallback(
    (day) => {
      const formattedDate = formatDate(day, "yyyy-MM-dd");
      setSelectedDate(formattedDate);
      if (onDateClick) {
        onDateClick(formattedDate);
      }
    },
    [onDateClick]
  );

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const handlePreviousYear = useCallback(() => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() - 1);
      return newDate;
    });
  }, []);

  const handleNextYear = useCallback(() => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + 1);
      return newDate;
    });
  }, []);

  const handleMonthSelect = useCallback(
    (monthIndex) => {
      const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
      setCurrentMonth(newDate);
      setShowDropdown(false);
    },
    [currentMonth]
  );

  // compact sizing
  const daySizeClass = compact ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  const headerPadding = compact ? "mb-2" : "mb-3";

  return (
    <div className="p-2 sm:p-0 w-full">
      {/* Header */}
      <div className={`relative w-full ${headerPadding}`}>
        <div className="grid grid-cols-3 items-center">
          {/* Left: Previous */}
          <button
            type="button"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
            className="px-2 py-1 text-sm hover:text-blue-600 justify-self-start"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>

          {/* Middle: Month + Dropdown */}
          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={() => setShowDropdown((s) => !s)}
              className="flex items-center space-x-2 font-semibold hover:text-blue-600"
            >
              <span className={compact ? "text-sm" : ""}>
                {formatDate(currentMonth, "MMMM yyyy")}
              </span>
              <img
                src={dropdownIcon}
                alt="toggle months"
                className={`w-4 h-4 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white border rounded shadow-lg w-48 z-50 p-2">
                {/* Year controls */}
                <div className="flex items-center justify-between mb-2">
                  <button onClick={handlePreviousYear} className="px-2">
                    <ChevronLeft size={24} strokeWidth={3} />
                  </button>
                  <span className="font-semibold">
                    {currentMonth.getFullYear()}
                  </span>
                  <button onClick={handleNextYear} className="px-2">
                    <ChevronRight size={24} strokeWidth={3} />
                  </button>
                </div>

                {/* Months */}
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const monthDate = new Date(
                      currentMonth.getFullYear(),
                      i,
                      1
                    );
                    const isThisMonth = i === currentMonth.getMonth();
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleMonthSelect(i)}
                        className={`px-2 py-1 rounded text-sm hover:bg-gray-100 ${
                          isThisMonth ? "bg-gray-100" : ""
                        }`}
                      >
                        {formatDate(monthDate, "MMM")}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Next */}
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="px-2 py-1 text-sm hover:text-blue-600 justify-self-end"
          >
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs gap-y-1 text-gray-500 mb-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonthString} // important: triggers animation on month change
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-y-1 text-center"
        >
          {days.map((dayObj, i) => {
            const formatted = formatDate(dayObj.date, "yyyy-MM-dd");
            const isToday = formatted === today;
            const isSelected = formatted === selectedDate;
            const isBooked = bookingDates.includes(formatted);

            let cls = `relative mx-auto flex ${daySizeClass} items-center justify-center rounded-full cursor-pointer transition `;

            if (!dayObj.isCurrentMonth) cls += "text-gray-300";
            if (isBooked && !isToday) cls += "bg-gray-500 text-white ";
            if (isToday) cls += "bg-blue-500 text-white ";
            if (isSelected) cls += "border-4 border-yellow-400 ";
            if (!isToday && !isBooked && dayObj.isCurrentMonth && !isSelected) {
              cls += "text-gray-700 hover:bg-gray-100 ";
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (dayObj.isCurrentMonth) {
                    handleDayClick(dayObj.date);
                  } else {
                    setCurrentMonth(
                      new Date(
                        dayObj.date.getFullYear(),
                        dayObj.date.getMonth(),
                        1
                      )
                    );
                    handleDayClick(dayObj.date);
                  }
                }}
                className={cls}
                aria-pressed={isSelected}
              >
                {dayObj.date.getDate()}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
