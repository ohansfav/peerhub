import { toast } from "react-hot-toast";
import { getErrorMessage } from "./getErrorMessage.js";

export function handleToastError(error, fallbackMessage) {
  const message = getErrorMessage(error, fallbackMessage);
  toast.error(message);
}

export function handleToastSuccess(fallbackMessage = "Success") {
  const message = fallbackMessage;

  toast.success(message);
}
