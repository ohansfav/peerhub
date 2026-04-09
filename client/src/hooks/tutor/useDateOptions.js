import { useMemo } from "react";
import { generateDateOptions } from "../../utils/time";

/**
 * Provides date options (next 30 days),
 * and auto-injects a past date if it's currently selected (for editing/rescheduling).
 *
 * @param {string|null} selectedDate - A YYYY-MM-DD string
 * @returns {Array<{value: string, label: string}>}
 */
export function useDateOptions(selectedDate) {
  return useMemo(() => {
    const baseOptions = generateDateOptions(); // future 30 days
    let options = [...baseOptions];

    if (selectedDate && !baseOptions.some((o) => o.value === selectedDate)) {
      options = [
        {
          value: selectedDate,
          label: new Date(selectedDate).toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        },
        ...baseOptions,
      ];
    }

    return options;
  }, [selectedDate]);
}
