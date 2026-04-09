import { AlertCircle, Calendar1, Check, Info } from "lucide-react";

export default function renderIcon(type) {
  switch (type) {
    case "session":
    case "success":
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </div>
      );
    case "request":
      return (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar1 className="w-5 h-5 text-primary" />
        </div>
      );
    case "warning":
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Info className="w-5 h-5 text-gray-600" />
        </div>
      );
  }
}
