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
  setBookingFilter,
  cancelBooking,
  type BookingsFilter,
} from "../../store";
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
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);
  const filter = useAppSelector((state) => state.bookings.filter) as BookingsFilter;
  const upcoming = useAppSelector(selectUpcomingBookings);
  const past = useAppSelector(selectPastBookings);

  useEffect(() => {
    dispatch({ type: "bookings/fetch", payload: filter });
  }, [dispatch, filter]);

  const handleFilterChange = (next: BookingsFilter) => {
    dispatch(setBookingFilter(next));
  };

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
        <Button variant="secondary" onClick={() => dispatch({ type: "bookings/fetch", payload: filter })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="booking-list">
      <div className="booking-list__filters">
        <Button
          variant={filter === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "customer" ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("customer")}
        >
          As Customer
        </Button>
        <Button
          variant={filter === "psychic" ? "primary" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("psychic")}
        >
          As Psychic
        </Button>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="state-container">
          <p>No bookings yet. Browse our psychics to get started!</p>
          <Link to="/">
            <Button variant="primary">Find a Psychic</Button>
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h3>Upcoming</h3>
          <div className="booking-list__grid">
            {upcoming.map((b: Booking) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={handleCancel}
              />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h3>Past Appointments</h3>
          <div className="booking-list__grid">
            {past.map((b: Booking) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={handleCancel}
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
}

function BookingCard({ booking, onCancel }: BookingCardProps) {
  const isUpcoming = useMemo(
    () =>
      new Date(booking.dateTime).getTime() >
      Date.now() &&
      booking.status !== "canceled",
    [booking.dateTime, booking.status]
  );

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
            <strong>Customer:</strong> {booking.customerName}
          </div>
          <div>
            <strong>Psychic:</strong> {booking.psychicName}
          </div>
          <div>
            <strong>Duration:</strong> {booking.duration} min
          </div>
        </div>

        {isUpcoming && booking.status === "confirmed" && (
          <Link to={`/consultation/${booking.id}`}>
            <Button variant="primary" size="sm">
              Start Consultation
            </Button>
          </Link>
        )}

        {isUpcoming && booking.status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(booking.id)}
          >
            Cancel Booking
          </Button>
        )}
      </div>
    </Card>
  );
}
