const OverviewPanel = ({ icon, text }) => {
  return (
    <div className="bg-[#F9FAFB] rounded-lg  p-4 min-h-[7.5rem] flex flex-col justify-between border">
      <img src={icon} alt="Streak" className="w-10 h-10 mb-1" />
      <p className="text-[#727C84] text-sm sm:text-base text-wrap leading-tight">
        {text}
      </p>
      <p className="text-[#2C3A47] font-semibold text-xs italic">coming soon</p>
    </div>
  );
};

export default OverviewPanel;
