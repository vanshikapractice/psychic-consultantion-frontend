import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner } from "../components/ui";
import { ReviewForm } from "../components/reviews";
import { consultationsApi } from "../api";
import type { Consultation } from "../types";

export function ReviewPage() {
  const { consultationId } = useParams<{ consultationId: string }>();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!consultationId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await consultationsApi.get(consultationId);
        setConsultation(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [consultationId]);

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
