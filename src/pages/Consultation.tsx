import { useParams } from "react-router-dom";
import { Card, Spinner } from "../components/ui";
import { ConsultationSession, ConsultationSummary } from "../components/consultations";
import { useConsultation } from "../hooks/useConsultation";

export function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const { consultation, loading, error, isRunning, elapsed, endConsultation } =
    useConsultation(id ?? "");

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
        <p role="alert">{error.message}</p>
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
          isRunning={isRunning}
          onEnd={async () => {
            await endConsultation();
          }}
        />
      </Card>
    </div>
  );
}
