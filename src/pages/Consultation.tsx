import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Spinner } from "../components/ui";
import { ConsultationSession, ConsultationSummary } from "../components/consultations";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectActiveConsultation,
  selectConsultationLoading,
  selectConsultationError,
  selectIsRunning,
  selectElapsed,
  selectFormattedDuration,
} from "../store";

export function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const consultation = useAppSelector(selectActiveConsultation);
  const loading = useAppSelector(selectConsultationLoading);
  const error = useAppSelector(selectConsultationError);
  const isRunning = useAppSelector(selectIsRunning);
  const elapsed = useAppSelector(selectElapsed);
  const formattedDuration = useAppSelector(selectFormattedDuration);

  useEffect(() => {
    if (id) {
      dispatch({ type: "consultations/fetch", payload: id });
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="state-container">
        <Spinner size="lg" />
        <p>Loading consultation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <p role="alert">{error}</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="state-container">
        <p>Consultation not found.</p>
      </div>
    );
  }

  if (consultation.status === "completed") {
    return (
      <div className="page">
        <ConsultationSummary consultation={consultation} />
      </div>
    );
  }

  return (
    <div className="page">
      <Card
        title="Active Consultation"
        subtitle={`Session with ${consultation.psychicName}`}
      >
        <ConsultationSession
          consultation={consultation}
          elapsed={elapsed}
          formattedDuration={formattedDuration}
          isRunning={isRunning}
          onEnd={() => {
            dispatch({ type: "consultations/end", payload: { consultationId: consultation.id } });
          }}
        />
      </Card>
    </div>
  );
}
