const BookingCard = ({ session }) => {
  return (
    <div className="flex items-center gap-3">
      <img
        src={session?.student?.user?.profileImageUrl}
        alt={`${session?.student?.user?.firstName} profile`}
        className="w-8 h-8 rounded-full"
      />
      <div>
        <p className="text-sm font-medium">{`${session?.student?.user?.firstName} ${session?.student?.user?.lastName}`}</p>
      </div>
    </div>
  );
};

export default BookingCard;
