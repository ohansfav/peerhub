const ProgressBar = ({ currentStep, totalSteps }) => (
  <div className="md:mt-2 mb-5 md:mb-10">
    <div className="flex gap-1 mb-2">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`flex-1 h-1 rounded ${
            index < currentStep ? "bg-blue-400" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
    <p className="text-sm text-right m-0">
      Step {currentStep}/{totalSteps}
    </p>
  </div>
);

export default ProgressBar;
