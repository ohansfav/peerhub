import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-md mx-auto">
        {/* 404 Number */}
        <h1
          className="text-6xl md:text-8xl font-bold mb-6"
          style={{ color: "#4CA1F0" }}
        >
          404
        </h1>

        {/* Fun Message */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Well… this page took a day off. Try going home or back.
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={handleGoHome}
            className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: "#4CA1F0" }}
          >
            Take Me Home
          </button>

          <button
            onClick={handleGoBack}
            className="text-gray-700 border border-gray-300 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 hover:bg-gray-100"
          >
            Turn Back 🌀
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
