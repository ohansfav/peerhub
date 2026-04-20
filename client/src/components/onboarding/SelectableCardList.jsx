const SelectableCardList = ({
  options,
  selectedItems,
  onToggle,
  roundedFull = false,
  className = "",
}) => (
  <div className="flex flex-wrap gap-2 justify-center">
    {options?.map((option) => (
      <div
        key={option.id}
        onClick={() => onToggle(option.id)}
        className={`flex items-center justify-center px-2 py-2 border cursor-pointer min-w-[60px] text-xs sm:text-sm max-w-[120px] whitespace-normal text-center ${className} ${
          roundedFull ? "rounded-full" : "rounded-md"
        } ${
          selectedItems.includes(option.id)
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-gray-700 border-gray-300"
        }`}
        style={{ wordBreak: "break-word" }}
      >
        {option.name}
      </div>
    ))}
  </div>
);

export default SelectableCardList;
