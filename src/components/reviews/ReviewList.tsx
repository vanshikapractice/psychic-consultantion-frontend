import { Avatar, Badge, Rating } from "../ui";
import { formatDate } from "../../utils/dateFormat";
import type { Review } from "../../types";

interface ReviewListProps {
  reviews: Review[];
  psychicName?: string;
}

export function ReviewList({ reviews, psychicName }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="review-list review-list--empty">
        <p>No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      <h3 className="review-list__header">
        Reviews {psychicName && `for ${psychicName}`}
      </h3>
      <div className="review-list__items">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

interface ReviewItemProps {
  review: Review;
}

function ReviewItem({ review }: ReviewItemProps) {
  return (
    <div className="review-item">
      <Avatar
        src={undefined}
        alt={review.customerName}
        name={review.customerName}
        size="sm"
      />
      <div className="review-item__body">
        <div className="review-item__header">
          <strong className="review-item__author">
            {review.customerName}
          </strong>
          <div className="review-item__rating">
            <Rating value={review.rating} readOnly size="sm" />
            <Badge variant="neutral" size="sm">
              {review.rating.toFixed(1)}
            </Badge>
          </div>
          <span className="review-item__date">
            {formatDate(review.createdAt)}
          </span>
        </div>
        <p className="review-item__comment">{review.comment}</p>
      </div>
    </div>
  );
}
