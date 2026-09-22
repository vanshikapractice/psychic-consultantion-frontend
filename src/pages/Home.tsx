import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PsychicsList } from "../components/psychics";
import { Badge, Button, Card } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectBookings } from "../store/selectors/bookingSelectors";
import { formatDateTime } from "../utils/dateFormat";

function CustomerHome() {
  return (
    <div className="page page--home">
      <section className="hero">
        <div className="container hero__content">
          <h1>Find Your Guide</h1>
          <p className="hero__subtitle">
            Connect with trusted psychics for readings on love, career,
            wellness, and spiritual growth.
          </p>
          <div className="hero__badges">
            <Badge variant="info">Verified Advisors</Badge>
            <Badge variant="success">Secure Sessions</Badge>
            <Badge variant="warning">Live Chat</Badge>
          </div>
        </div>
      </section>

      <section className="page__section">
        <h2>Available Psychics</h2>
        <PsychicsList showSearch showFilter />
      </section>
    </div>
  );
}

function PsychicHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);

  useEffect(() => {
    dispatch({ type: "bookings/fetch", payload: "psychic" });
  }, [dispatch]);

  const pending = bookings.filter((b) => b.status === "pending");
  const ready = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );

  return (
    <div className="page page--psychic-home">
      <div className="psychic-home__header">
        <h1>Welcome, {user?.name}</h1>
        <p>Incoming session requests from your customers</p>
        <Link to="/psychic/dashboard">
          <Button variant="secondary" size="sm">
            Open full dashboard
          </Button>
        </Link>
      </div>

      <div className="psychic-home__stats">
        <Card className="stat-card">
          <div className="stat-card__value">{pending.length}</div>
          <div className="stat-card__label">Awaiting confirmation</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-card__value">{ready.length}</div>
          <div className="stat-card__label">Ready for live chat</div>
        </Card>
      </div>

      <section className="page__section">
        <h2>Recent requests</h2>

        {bookings.length === 0 ? (
          <div className="state-container">
            <p>No requests yet. They will appear here when customers book a session.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {bookings.slice(0, 6).map((booking) => (
              <Card
                key={booking.id}
                title={booking.customerName || "Customer"}
                subtitle={formatDateTime(booking.dateTime)}
                hover
                headerAction={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/booking/${booking.id}`)}
                  >
                    {booking.status === "pending" ? "Review" : "Join"}
                  </Button>
                }
              >
                <div className="request-card__info">
                  <div className="request-card__field">
                    <span className="request-card__label">Status</span>
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "success"
                          : booking.status === "pending"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="request-card__field">
                    <span className="request-card__label">Duration</span>
                    <span>{booking.duration} min</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function Home() {
  const { user } = useAuth();

  if (user?.role === "psychic") {
    return <PsychicHome />;
  }

  return <CustomerHome />;
}
