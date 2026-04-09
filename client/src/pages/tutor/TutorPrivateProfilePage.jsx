import { usePrivateTutorProfile } from "../../hooks/tutor/useTutorProfile";
import RatingSummary from "../../components/common/RatingSummary";
import ReviewList from "../../components/common/ReviewList";
import BackButton from "../../components/common/BackButton";
import Spinner from "../../components/common/Spinner";
import { NavLink } from "react-router-dom";

const TutorPrivateProfilePage = () => {
  const {
    profile,
    reviews,
    isLoadingProfileQuery,
    isLoadingReviewsQuery,
    errorProfileQuery,
    errorReviewsQuery,
  } = usePrivateTutorProfile();

  return (
    <div className="w-full overflow-x-hidden">
      <div className="px-4 ">
        <BackButton to={-1} />
      </div>

      <div className="px-2 sm:px-8 md:pb-8 sm:mt-8">
        {/* Tutor Header */}
        {isLoadingProfileQuery ? (
          <Spinner />
        ) : errorProfileQuery ? (
          <p className="text-red-500">Failed to load tutor profile.</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
              {/* Avatar */}
              <div className="avatar avatar-online shrink-0">
                <div className="w-20 sm:w-24 rounded-full">
                  <img
                    src={profile?.profileImageUrl}
                    alt={`${profile?.firstName} ${profile?.lastName}`}
                    className="w-auto sm:w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Name, Subjects, and Edit Button */}
              <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                <h1 className="font-bold text-xl sm:text-2xl break-words">
                  {profile?.firstName} {profile?.lastName}
                </h1>
                <div className="mt-2">
                  <p className="text-sm text-primary font-semibold break-words">
                    {profile?.tutor?.subjects?.map((s) => s.name).join(" · ")}
                  </p>
                </div>

                {/* Edit Profile Button */}
                <div className="mt-3 sm:mt-4">
                  <NavLink
                    to="/tutor/settings"
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
                  >
                    Edit Profile
                  </NavLink>
                </div>
              </div>
            </div>

            {/* About  */}
            <div className="mt-6">
              <h2 className="font-bold text-lg">About Me</h2>
              <p className="text-sm mt-2 text-gray-500 leading-relaxed break-words">
                {profile?.tutor.bio || "No bio"}
              </p>
            </div>
            {/* Rating */}
            <div className="mt-3 md:mt-6">
              <RatingSummary stats={profile?.tutor?.stats} />
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

export default TutorPrivateProfilePage;
