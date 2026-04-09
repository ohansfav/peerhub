import SelectableCardList from "../onboarding/SelectableCardList";

export const SingleSelectCardList = ({
  options,
  selectedItem,
  onSelect,
  ...props
}) => {
  return (
    <SelectableCardList
      options={options}
      selectedItems={selectedItem ? [Number(selectedItem)] : []}
      onToggle={(id) => onSelect(id)}
      {...props}
    />
  );
};
