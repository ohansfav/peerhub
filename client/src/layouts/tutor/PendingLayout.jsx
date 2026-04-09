import { Hourglass } from "lucide-react";
export default function PendingLayout() {
  return (
    <div className="bg-white rounded-lg border shadow p-8 flex flex-col justify-center items-center min-h-[400px]">
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
        <Hourglass className="w-8 h-8 text-orange-600" />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold mb-4">Verification in progress</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          We are currently reviewing your verification request. This helps us
          keep the platform secure for all users. You'll receive a notification
          as soon as the process is complete.
        </p>
      </div>
    </div>
  );
}
