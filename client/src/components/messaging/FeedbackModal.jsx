import { useState } from "react";
import PropTypes from "prop-types";
import Modal from "../ui/Modal";
import StarRating from "../ui/StarRating";
import Button from "../ui/Button";

const FeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
  revieweeName,
  isSubmitting,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({ rating, comment });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Rate your session with ${revieweeName}`}
    >
      <div className="flex flex-col space-y-4">
        <p className="text-gray-600">
          Help us improve by rating your experience and leaving a comment.
        </p>
        <div className="flex justify-center">
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
          rows="4"
          placeholder="Leave a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <Button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            loading={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

FeedbackModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  revieweeName: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool,
};

FeedbackModal.defaultProps = {
  isSubmitting: false,
};

export default FeedbackModal;
