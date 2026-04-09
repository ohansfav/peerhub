/**
 * Normalizes an API/Network error into a displayable string.
 *
 * @param {any} error - The raw error object (Axios, React Query, or JS Error).
 * @param {string} fallbackMessage - Message if nothing useful is found.
 * @returns {string}
 */
export function getErrorMessage(
  error,
  fallbackMessage = "Something went wrong"
) {
  const responseData = error?.response?.data;

  // 1. Validation errors (array of strings)
  if (Array.isArray(responseData?.error)) {
    const stringErrors = responseData.error.filter(
      (e) => typeof e === "string"
    );
    if (stringErrors.length > 0) {
      return stringErrors.join(" | ");
    }

    // Validation errors shaped like [{ field, issue }]
    if (responseData.error[0]?.issue) {
      return responseData.error.map((e) => e.issue).join(" | ");
    }
  }

  // 2. Server-provided message
  if (responseData?.message) {
    return responseData.message;
  }

  // 3. Generic JS error message
  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
}
