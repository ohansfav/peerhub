import React from "react";
import { Star } from "lucide-react";
import { formatDate } from "../../utils/time";

const ReviewList = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return <p className="text-gray-500">No reviews</p>;
  }

  return (
    <div>
      {reviews.map((review, idx) => (
        <div
          key={idx}
          className="pb-4 p-3 md:p-5 border rounded-lg shadow-sm mb-4 last:mb-2"
        >
          <div className="flex gap-3 items-start">
            <div className="avatar shrink-0">
              <div className="w-12 rounded-full">
                <img
                  src={review.reviewer?.profileImageUrl}
                  alt={`${review.reviewer?.firstName ?? "User"} ${
                    review.reviewer?.lastName ?? ""
                  }`}
                />
              </div>
            </div>
            <div>
              <h1 className="font-bold">
                {review.reviewer?.firstName ?? "Anonymous"}{" "}
                {review.reviewer?.lastName ?? ""}
              </h1>
              <p className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </p>
              <div className="flex mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < (review.stars || 0) ? "currentColor" : "none"}
                    className={`text-primary ${
                      i >= (review.stars || 0) ? "opacity-30" : ""
                    }`}
                  />
                ))}
              </div>
              {review.comment && (
                <p className="text-sm mt-2 text-gray-700">{review.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
