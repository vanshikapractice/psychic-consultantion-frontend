import { useState } from "react";
import { Button, ProgressBar } from "../ui";
import { formatCurrency, formatTimer } from "../../utils/dateFormat";
import type { Consultation } from "../../types";

interface ConsultationSessionProps {
  consultation: Consultation;
  elapsed: number;
  isRunning: boolean;
  onEnd: () => Promise<void>;
}

export function ConsultationSession({
  consultation,
  elapsed,
  isRunning,
  onEnd,
}: ConsultationSessionProps) {
  const [ending, setEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rate = consultation.rate ?? 0;
  const sessionCost = (elapsed / 60) * rate;

  const handleEnd = async () => {
    setShowEndConfirm(false);
    setError(null);
    setEnding(true);
    try {
      await onEnd();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="consultation-session">
      {error && <p role="alert">{error}</p>}

      <div className="consultation-session__timer">
        <span className="consultation-session__time">{formatTimer(elapsed)}</span>
        <span className="consultation-session__status">
          {isRunning ? "Recording…" : "Paused"}
        </span>
      </div>

      <ProgressBar
        value={elapsed}
        max={consultation.rate > 0 ? 60 * 30 : 60 * 30}
        variant={elapsed > 1800 ? "warning" : "default"}
        label={`Current cost: ${formatCurrency(sessionCost)}`}
        showValue
      />

      <div className="consultation-session__actions">
        <Button
          variant="danger"
          onClick={() => setShowEndConfirm(true)}
          disabled={!isRunning || ending}
        >
          {ending ? "Ending…" : "End Session"}
        </Button>
      </div>

      {showEndConfirm && (
        <div className="consultation-confirm">
          <p>End this consultation? The session will be finalized and billed.</p>
          <div className="consultation-confirm__actions">
            <Button variant="outline" size="sm" onClick={() => setShowEndConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleEnd}>
              End & View Summary
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
