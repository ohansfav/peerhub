import { Link } from "react-router-dom";

const TutorSearchCard = ({ tutor, compact = false }) => (
  <div
    className={`flex flex-col p-4 border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition w-full ${
      compact ? "h-[180px]" : ""
    }`}
  >
    <div className="flex items-center gap-4 mb-3 flex-shrink-0">
      <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={tutor.user.profileImageUrl}
          alt={`${tutor?.user.firstName} ${tutor?.user.lastName}`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg truncate">
          {tutor?.user.firstName} {tutor?.user.lastName}
        </h3>

        <p
          className={`text-sm text-primary mt-1 ${
            compact ? "line-clamp-1" : "line-clamp-2"
          }`}
        >
          {tutor?.subjects?.map((s) => s.name).join(" • ")}
        </p>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {tutor?.bio || "No bio."}
        </p>
      </div>
    </div>

    <Link
      to={`/student/tutor-profile/${tutor.userId}`}
      className="mt-auto self-end px-4 py-2 text-sm bg-primary text-white rounded-full hover:bg-primary-focus text-center no-underline flex-shrink-0"
    >
      View Profile
    </Link>
  </div>
);

export default TutorSearchCard;
