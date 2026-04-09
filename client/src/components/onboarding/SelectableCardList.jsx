const SelectableCardList = ({
  options,
  selectedItems,
  onToggle,
  roundedFull = false,
  className = "",
}) => (
  <div className="flex flex-wrap gap-4 justify-center">
    {options?.map((option) => (
      <div
        key={option.id}
        onClick={() => onToggle(option.id)}
        className={`flex items-center justify-center px-4 py-3 border cursor-pointer min-w-[80px] text-sm ${className} ${
          roundedFull ? "rounded-full" : "rounded-md"
        } ${
          selectedItems.includes(option.id)
            ? "bg-blue-400 text-white border-blue-400"
            : "bg-white text-gray-700 border-gray-300"
        }`}
      >
        {option.name}
      </div>
    ))}
  </div>
);

export default SelectableCardList;
