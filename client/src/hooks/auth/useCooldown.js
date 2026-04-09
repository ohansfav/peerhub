export function useCooldown(retryAfter) {
  if (!retryAfter || typeof retryAfter !== "number" || retryAfter <= 0) {
    return { formattedTime: "", label: "", isActive: false };
  }

  const hours = Math.floor(retryAfter / 3600);
  const minutes = Math.floor((retryAfter % 3600) / 60);
  const seconds = retryAfter % 60;

  if (hours > 0) {
    return {
      formattedTime: `${hours}:${String(minutes).padStart(2, "0")}`,
      label: hours === 1 ? "hour" : "hours",
      isActive: true,
    };
  }

  if (minutes > 0) {
    return {
      formattedTime: `${minutes}:${String(seconds).padStart(2, "0")}`,
      label: minutes === 1 ? "minute" : "minutes",
      isActive: true,
    };
  }

  return {
    formattedTime: `${seconds}`,
    label: seconds === 1 ? "second" : "seconds",
    isActive: true,
  };
}
