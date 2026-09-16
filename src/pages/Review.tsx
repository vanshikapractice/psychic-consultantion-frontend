import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner } from "../components/ui";
import { ReviewForm } from "../components/reviews";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectActiveConsultation, selectConsultationLoading, selectConsultationError } from "../store";

export function ReviewPage() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const consultation = useAppSelector(selectActiveConsultation);
  const loading = useAppSelector(selectConsultationLoading);
  const error = useAppSelector(selectConsultationError);

  useEffect(() => {
    if (consultationId) {
      dispatch({ type: "consultations/fetch", payload: consultationId });
    }
  }, [dispatch, consultationId]);

  if (loading) {
    return (
      <div className="state-container">
        <Spinner size="lg" />
        <p>Loading…</p>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="state-container">
        <p role="alert">{error ?? "Consultation not found."}</p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="page page--review">
      <Card title="Leave a Review">
        <ReviewForm consultation={consultation} />
      </Card>
    </div>
  );
}
