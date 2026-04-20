import { useNavigate, useParams } from "react-router-dom";
import { useStudentTutorPage } from "../../hooks/tutor/useTutorProfile";
import RatingSummary from "../../components/common/RatingSummary";
import ReviewList from "../../components/common/ReviewList";
import BackButton from "../../components/common/BackButton";
import TutorSchedule from "../../components/tutor/TutorSchedule";
import Spinner from "../../components/common/Spinner";
import { useStudentBooking } from "../../hooks/student/useStudentBooking";

const StudentTutorProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    profile,
    reviews,
    isLoadingProfileQuery,
    isLoadingReviewsQuery,
    errorProfileQuery,
    errorReviewsQuery,
  } = useStudentTutorPage(id);

  const { availabilityData: availability, availabilityLoading } =
    useStudentBooking(id, new Date(), null);

  return (
    <div className="w-full overflow-x-hidden">
      <BackButton to="/student/tutors" />
      <div className="px-2 sm:px-8 md:pb-8">
        {/* Tutor Header */}
        {isLoadingProfileQuery ? (
          <Spinner />
        ) : errorProfileQuery ? (
          <p className="text-red-500">Failed to load tutor profile.</p>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-1 sm:gap-6 items-center">
              <div className="avatar avatar-online shrink-0 self-center">
                <div className="w-20 sm:w-24 rounded-full">
                  <img
                    src={profile?.user?.profileImageUrl || "https://via.placeholder.com/96x96?text=Tutor"}
                    alt={`${profile?.user?.firstName || "Tutor"} ${profile?.user?.lastName || ""}`.trim()}
                    className="w-auto sm:w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0 sm:w-full w-auto text-center sm:text-left">
                <h1 className="font-bold text-xl sm:text-2xl break-words">
                  {profile?.user.firstName} {profile?.user.lastName}
                </h1>

                <div className="mt-2">
                  <p className="text-sm text-primary font-semibold break-words">
                    {profile?.subjects?.map((s) => s.name).join(" · ")}
                  </p>
                </div>

                <div className="mt-2">
                  {availabilityLoading ? (
                    <Spinner />
                  ) : (
                    <TutorSchedule availability={availability} />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 md:mt-4 mb-2">
                  <button
                    onClick={() => navigate(`/student/booking/${id}`)}
                    className="btn btn-primary rounded-full bg-primary text-white border-none shadow-md hover:bg-white hover:text-primary transition-colors duration-200 w-full sm:w-auto px-6"
                  >
                    Book Session
                  </button>
                  <button
                    onClick={() => navigate(`/student/chat/${profile.user.id}`)}
                    className="btn rounded-full border-2 border-primary bg-white text-primary shadow-md hover:bg-primary hover:text-white transition-colors duration-200 w-full sm:w-auto px-6"
                  >
                    Message Tutor
                  </button>
                </div>
              </div>
            </div>
            {/* About */}
            <div className="mt-6">
              <h2 className="font-bold text-lg">About Me</h2>
              <p className="text-sm mt-2 text-gray-500 leading-relaxed break-words">
                {profile?.bio || "No bio"}
              </p>
            </div>
            {/* Rating */}
            <div className="mt-3 md:mt-6">
              <RatingSummary stats={profile?.stats} />
            </div>
          </>
        )}

        {/* Reviews */}
        <div className="mt-6">
          <h2 className="font-bold text-lg mb-4">Reviews</h2>
          {isLoadingReviewsQuery ? (
            <Spinner />
          ) : errorReviewsQuery ? (
            <p className="text-red-500">Failed to load tutor reviews.</p>
          ) : (
            <ReviewList reviews={reviews} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTutorProfilePage;
