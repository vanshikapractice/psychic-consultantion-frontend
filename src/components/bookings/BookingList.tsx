import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Badge, Button, Card, Spinner } from "../ui";
import {
  useAppDispatch,
  useAppSelector,
} from "../../store/hooks";
import {
  selectBookingLoading,
  selectBookingError,
  selectUpcomingBookings,
  selectPastBookings,
  cancelBooking,
} from "../../store";
import { selectAuthUser } from "../../store/selectors/authSelectors";
import type { Booking, BookingStatus } from "../../types";
import { formatDateTime } from "../../utils/dateFormat";

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  canceled: "Canceled",
  completed: "Completed",
};

const STATUS_VARIANT: Record<BookingStatus, "warning" | "success" | "error" | "neutral" | "info"> = {
  pending: "warning",
  confirmed: "success",
  canceled: "error",
  completed: "neutral",
};

export function BookingList() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);
  const upcoming = useAppSelector(selectUpcomingBookings);
  const past = useAppSelector(selectPastBookings);
  const isPsychic = user?.role === "psychic";

  useEffect(() => {
    const filter = isPsychic ? "psychic" : "customer";
    dispatch({ type: "bookings/fetch", payload: filter });
  }, [dispatch, isPsychic]);

  const handleCancel = (id: string) => {
    dispatch(cancelBooking(id));
  };

  if (loading) {
    return (
      <div className="state-container">
        <Spinner size="lg" />
        <p>Loading your appointments…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container">
        <p role="alert">{error}</p>
        <Button variant="secondary" onClick={() => dispatch({ type: "bookings/fetch", payload: isPsychic ? "psychic" : "customer" })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="booking-list">
      {upcoming.length === 0 && past.length === 0 && (
        <div className="state-container">
          <p>
            {isPsychic
              ? "No session requests yet. Customers will appear here after they book with you."
              : "No bookings yet. Browse our psychics to get started!"}
          </p>
          {!isPsychic && (
            <Link to="/">
              <Button variant="primary">Find a Psychic</Button>
            </Link>
          )}
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h3>{isPsychic ? "Upcoming sessions" : "Upcoming"}</h3>
          <div className="booking-list__grid">
            {upcoming.map((b: Booking) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={handleCancel}
                isPsychic={isPsychic}
              />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h3>Past appointments</h3>
          <div className="booking-list__grid">
            {past.map((b: Booking) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={handleCancel}
                isPsychic={isPsychic}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel: (id: string) => void;
  isPsychic: boolean;
}

function BookingCard({ booking, onCancel, isPsychic }: BookingCardProps) {
  const isUpcoming = useMemo(
    () =>
      booking.status !== "canceled" &&
      booking.status !== "completed",
    [booking.status]
  );

  const peerLabel = isPsychic ? booking.customerName || "Customer" : booking.psychicName;

  return (
    <Card
      title={
        <div className="booking-card__title">
          <Badge variant={STATUS_VARIANT[booking.status]}>
            {STATUS_LABELS[booking.status]}
          </Badge>
        </div>
      }
      subtitle={formatDateTime(booking.dateTime)}
      hover
    >
      <div className="booking-card__content">
        <div className="booking-card__participants">
          <div>
            <strong>{isPsychic ? "Customer" : "Psychic"}:</strong> {peerLabel}
          </div>
          <div>
            <strong>Duration:</strong> {booking.duration} min
          </div>
        </div>

        <div className="booking-card__actions">
          <Link to={`/booking/${booking.id}`}>
            <Button variant="primary" size="sm">
              {isPsychic
                ? booking.status === "pending"
                  ? "Review request"
                  : "Open session"
                : "View booking"}
            </Button>
          </Link>

          {!isPsychic && isUpcoming && booking.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(booking.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
