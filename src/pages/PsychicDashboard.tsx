import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Spinner } from "../components/ui";
import { BookingList } from "../components/bookings";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectAuthUser, selectBookings } from "../store";
import { consultationsApi } from "../api";
import type { Consultation } from "../types";
import { formatDateTime, formatCurrency } from "../utils/dateFormat";

export function PsychicDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const bookings = useAppSelector(selectBookings);

  const [liveSessions, setLiveSessions] = useState<Consultation[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);

  useEffect(() => {
    dispatch({ type: "bookings/fetch", payload: "psychic" });
  }, [dispatch]);

  useEffect(() => {
    setLoadingLive(true);
    consultationsApi
      .listIncoming()
      .then(setLiveSessions)
      .catch((err) => setLiveError((err as Error).message))
      .finally(() => setLoadingLive(false));
  }, []);

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === "pending"),
    [bookings]
  );

  const confirmedBookings = useMemo(
    () => bookings.filter((b) => b.status === "confirmed" || b.status === "pending"),
    [bookings]
  );

  const activeLive = liveSessions.filter((c) => c.status === "active");

  const handleJoinLive = async (consultationId: string) => {
    navigate(`/consultation/${consultationId}`);
  };

  return (
    <div className="page page--dashboard">
      <div className="dashboard__header">
        <h1>Welcome back, {user?.name}</h1>
        <p>Manage incoming requests and live consultations</p>
      </div>

      <div className="dashboard__stats">
        <Card className="stat-card">
          <div className="stat-card__value">{pendingBookings.length}</div>
          <div className="stat-card__label">Pending requests</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-card__value">{confirmedBookings.length}</div>
          <div className="stat-card__label">Ready to start</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-card__value">{activeLive.length}</div>
          <div className="stat-card__label">Live now</div>
        </Card>
      </div>

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>Live consultations</h2>
          <Badge variant={activeLive.length > 0 ? "success" : "neutral"}>
            {activeLive.length} active
          </Badge>
        </div>

        {loadingLive ? (
          <div className="state-container">
            <Spinner size="lg" />
            <p>Loading live sessions…</p>
          </div>
        ) : liveError ? (
          <div className="state-container">
            <p role="alert">{liveError}</p>
          </div>
        ) : liveSessions.length === 0 ? (
          <div className="state-container">
            <p>No active consultations. Start one from a confirmed booking below.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {liveSessions.map((session) => (
              <Card
                key={session.id}
                title={session.customerName ?? `Customer #${session.customerId}`}
                subtitle={formatDateTime(session.startTime)}
                hover
                headerAction={
                  session.status === "active" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleJoinLive(session.id)}
                    >
                      Join chat
                    </Button>
                  ) : (
                    <Badge variant="neutral">{session.status}</Badge>
                  )
                }
              >
                <div className="request-card__info">
                  <div className="request-card__field">
                    <span className="request-card__label">Booking</span>
                    <span>#{session.bookingId}</span>
                  </div>
                  <div className="request-card__field">
                    <span className="request-card__label">Est. value</span>
                    <span>{formatCurrency(session.totalPrice)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard__section">
        <div className="dashboard__section-header">
          <h2>Session requests</h2>
          <Badge variant="info">Psychic view</Badge>
        </div>
        <BookingList />
      </section>
    </div>
  );
}
