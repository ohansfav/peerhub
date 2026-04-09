const BookingDetailRow = ({ label, value }) => (
  <div className="flex items-center gap-12">
    <p className="text-sm text-gray-500 w-24">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

const SlotButton = ({ slot, selected, onClick }) => (
  <button
    onClick={() => onClick(slot.id)}
    className={`px-3 py-1 rounded-lg border ${
      selected ? "bg-blue-600 text-white" : "bg-gray-100"
    }`}
  >
    {slot.label}
  </button>
);

export { BookingDetailRow, SlotButton };
