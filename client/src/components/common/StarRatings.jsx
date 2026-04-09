import { Star } from "lucide-react";

export default function StarRating({ rating = 0, size = 20 }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => {
        const isFullStar = i < Math.floor(rating);
        const isPartialStar = i === Math.floor(rating) && rating % 1 !== 0;
        const fillPercentage = isPartialStar ? (rating % 1) * 100 : 0;

        return (
          <div key={i} className="relative inline-block">
            {/* Empty star */}
            <Star size={size} className="text-primary opacity-30" />

            {/* Filled portion */}
            {(isFullStar || isPartialStar) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: isFullStar ? "100%" : `${fillPercentage}%` }}
              >
                <Star size={size} className="text-primary fill-current" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
