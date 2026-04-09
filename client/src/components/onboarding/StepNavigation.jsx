import Button from "../ui/Button";

const StepNavigation = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  disableNext,
  isLoading,
}) => (
  <div className=" flex gap-2">
    {currentStep > 1 && (
      <Button
        type="button"
        onClick={onBack}
        className="bg-gray-700 text-white hover:bg-blue-600"
      >
        Back
      </Button>
    )}
    {currentStep < totalSteps ? (
      <Button
        type="button"
        onClick={onNext}
        disabled={disableNext}
        className={`${
          disableNext
            ? "bg-gray-200 text-white cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Continue
      </Button>
    ) : (
      <Button
        type="button"
        onClick={onSubmit}
        className={`${
          disableNext
            ? "bg-gray-200 text-white cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
        disabled={disableNext}
        loading={isLoading}
      >
        Submit
      </Button>
    )}
  </div>
);

export default StepNavigation;
