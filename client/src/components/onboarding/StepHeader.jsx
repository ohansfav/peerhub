const StepHeader = ({ title, subtitle }) => (
  <div className="flex flex-col justify-center items-center mb-8 text-center">
    <h1 className="font-bold text-3xl mb-2">{title}</h1>
    <p className="text-gray-500 text-md">{subtitle}</p>
  </div>
);

export default StepHeader;
