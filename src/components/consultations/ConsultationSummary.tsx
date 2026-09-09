import { Link } from "react-router-dom";
import { Button, Card, Badge } from "../ui";
import { formatCurrency, formatDuration } from "../../utils/dateFormat";
import type { Consultation } from "../../types";

interface ConsultationSummaryProps {
  consultation: Consultation;
}

export function ConsultationSummary({ consultation }: ConsultationSummaryProps) {
  return (
    <Card title="Consultation Summary" subtitle="Session completed">
      <div className="consultation-summary">
        <div className="consultation-summary__stats">
          <div className="consultation-summary__stat">
            <span className="consultation-summary__stat-value">
              {formatDuration(consultation.duration)}
            </span>
            <span className="consultation-summary__stat-label">
              Total Duration
            </span>
          </div>
          <div className="consultation-summary__stat">
            <span className="consultation-summary__stat-value">
              ${consultation.rate.toFixed(2)}/min
            </span>
            <span className="consultation-summary__stat-label">Rate</span>
          </div>
          <div className="consultation-summary__stat">
            <span className="consultation-summary__stat-value">
              {formatCurrency(consultation.totalPrice)}
            </span>
            <span className="consultation-summary__stat-label">Total Cost</span>
          </div>
        </div>

        <Badge variant="success">
          Session ended at{" "}
          {new Date(consultation.endTime ?? "").toLocaleTimeString()}
        </Badge>

        {consultation.costLog.length > 0 && (
          <div className="consultation-summary__cost-log">
            <h4>Billing Log</h4>
            <table className="cost-log-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Duration</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {consultation.costLog.map((entry, i) => (
                  <tr key={i}>
                    <td>{new Date(entry.at).toLocaleTimeString()}</td>
                    <td>{formatDuration(entry.duration)}</td>
                    <td>{formatCurrency(entry.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Link to={`/review/${consultation.id}`}>
          <Button variant="primary" className="consultation-summary__review-btn">
            Leave a Review
          </Button>
        </Link>
      </div>
    </Card>
  );
}
