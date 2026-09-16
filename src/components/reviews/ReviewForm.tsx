import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Textarea, Rating } from "../ui";
import { useAppDispatch } from "../../store/hooks";
import type { Consultation } from "../../types";

interface ReviewFormProps {
  consultation: Consultation;
}

export function ReviewForm({ consultation }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a review.");
      return;
    }

    setSubmitting(true);
    setError(null);
    dispatch({
      type: "reviews/create",
      payload: { consultationId: consultation.id, rating, comment },
    });
    navigate(`/psychic/${consultation.psychicId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Review Your Session</h3>
      <p className="review-form__subtitle">
        How was your consultation with {consultation.psychicName}?
      </p>

      {error && (
        <div className="auth-form__error" role="alert">
          {error}
        </div>
      )}

      <div className="review-form__rating">
        <label className="field__label">Your Rating</label>
        <Rating value={rating} onRate={setRating} size="lg" />
      </div>

      <Textarea
        label="Your Review"
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        required
      />

      <div className="review-form__actions">
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
