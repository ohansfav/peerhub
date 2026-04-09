import { AlertCircle } from "lucide-react";
export default function RejectedLayout() {
  return (
    <div className="bg-white rounded-lg border shadow p-8 flex flex-col justify-center items-center min-h-[400px]">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-xl font-semibold mb-4">Verification Rejected</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Unfortunately, we couldn't approve your verification request at this
          time. This may be due to unclear documents or information mismatch.
          Please review the details and resubmit.
        </p>
      </div>
    </div>
  );
}
