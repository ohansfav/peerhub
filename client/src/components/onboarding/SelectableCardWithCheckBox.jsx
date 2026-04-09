const SelectableCardWithCheckbox = ({ options, selectedItems, onToggle }) => (
  <div className="flex flex-col gap-8 md:gap-3 ">
    {options.map((option) => (
      <label
        key={option}
        className={`flex items-center gap-3 px-4 py-3 border rounded-md cursor-pointer ${
          selectedItems.includes(option)
            ? "bg-blue-400 text-white border-blue-400"
            : "bg-white text-gray-700 border-gray-300"
        }`}
      >
        <input
          type="checkbox"
          checked={selectedItems.includes(option)}
          onChange={() => onToggle(option)}
          className="w-5 h-5 cursor-pointer accent-black-500"
        />
        <span className="text-sm">{option}</span>
      </label>
    ))}
  </div>
);

export default SelectableCardWithCheckbox;
