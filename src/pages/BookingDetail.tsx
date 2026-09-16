import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, Spinner } from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectBookingById,
  selectBookingLoading,
  selectBookingError,
  selectBookingFilter,
  updateBookingStatus,
} from "../store";
import { selectAuthUser } from "../store/selectors/authSelectors";
import { consultationsApi } from "../api";
import { formatDateTime } from "../utils/dateFormat";

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const booking = useAppSelector((state) => selectBookingById(id ?? "")(state));
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);
  const currentFilter = useAppSelector(selectBookingFilter);

  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStartConsultation = async () => {
    if (!booking) return;
    setStarting(true);
    setActionError(null);
    try {
      const consultation = await consultationsApi.start(booking.id);
      dispatch(updateBookingStatus({ id: booking.id, status: "confirmed" }));
      dispatch({ type: "bookings/fetch", payload: currentFilter });
      navigate(`/consultation/${consultation.id}`);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setStarting(false);
    }
  };

  const handleConfirm = () => {
    if (!booking) return;
    dispatch(updateBookingStatus({ id: booking.id, status: "confirmed" }));
    dispatch({ type: "bookings/fetch", payload: currentFilter });
  };

  if (loading) {
    return (
      <div className="state-container">
        <Spinner size="lg" />
        <p>Loading booking…</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="state-container">
        <p role="alert">{error ?? "Booking not found."}</p>
        <Link to="/bookings">
          <Button variant="secondary">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  const isCustomer = user?.role === "customer";
  const isPsychic = user?.role === "psychic";
  const canStart =
    (isCustomer || isPsychic) && booking.status === "confirmed";
  const canConfirm = isPsychic && booking.status === "pending";

  return (
    <div className="page">
      <Card
        title={isCustomer ? "Your Booking" : "Booking Details"}
        headerAction={
          <Link to="/bookings">
            <Button variant="ghost" size="sm">
              Back
            </Button>
          </Link>
        }
      >
        <div className="booking-detail">
          <div className="booking-detail__participants">
            <div className="booking-detail__participant">
              <span className="booking-detail__label">Customer</span>
              <span>{booking.customerName}</span>
            </div>
            <div className="booking-detail__participant">
              <span className="booking-detail__label">Psychic</span>
              <span>{booking.psychicName}</span>
            </div>
          </div>

          <div className="booking-detail__info">
            <div>
              <span className="booking-detail__label">Date & Time</span>
              <span>{formatDateTime(booking.dateTime)}</span>
            </div>
            <div>
              <span className="booking-detail__label">Duration</span>
              <span>{booking.duration} min</span>
            </div>
            <Badge
              variant={
                booking.status === "confirmed"
                  ? "success"
                  : booking.status === "canceled"
                  ? "error"
                  : "warning"
              }
            >
              {booking.status}
            </Badge>
          </div>

          {actionError && <p role="alert">{actionError}</p>}

          <div className="booking-detail__actions">
            {canConfirm && (
              <Button variant="secondary" onClick={handleConfirm}>
                Confirm Appointment
              </Button>
            )}
            {canStart && (
              <Button
                variant="primary"
                loading={starting}
                disabled={starting}
                onClick={handleStartConsultation}
              >
                {starting ? "Starting…" : "Start Consultation"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
