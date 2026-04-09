import { getErrorMessage } from "../../utils/getErrorMessage.js";

const ErrorAlert = ({ error }) => {
  if (!error) return null;

  const message = typeof error === "string" ? error : getErrorMessage(error);
  return (
    <div className="alert alert-error p-2 w-full max-w-sm md:max-w-xl mx-auto my-1">
      <ul className="list-none pl-0 list-inside text-sm">
        <li>{message}</li>
      </ul>
    </div>
  );
};

export default ErrorAlert;
