import { LoaderIcon } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoaderIcon className="animate-spin size-10 text-primary" />
    </div>
  );
};

export function PageLoaderMessage({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-700 font-medium">{message}</p>
    </div>
  );
}

export default PageLoader;
