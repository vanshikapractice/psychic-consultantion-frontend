import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, Spinner } from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectBookingById,
  selectBookingLoading,
  selectBookingError,
  updateBookingStatus,
} from "../store";
import { selectAuthUser } from "../store/selectors/authSelectors";
import { bookingsApi, consultationsApi } from "../api";
import { formatDateTime } from "../utils/dateFormat";

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const bookingFromStore = useAppSelector((state) => selectBookingById(id ?? "")(state));
  const loading = useAppSelector(selectBookingLoading);
  const error = useAppSelector(selectBookingError);

  const [booking, setBooking] = useState(bookingFromStore);
  const [fetching, setFetching] = useState(!bookingFromStore);
  const [starting, setStarting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (bookingFromStore) {
      setBooking(bookingFromStore);
      return;
    }
    setFetching(true);
    bookingsApi
      .get(id)
      .then((loaded) => {
        setBooking(loaded);
      })
      .catch((err) => setActionError((err as Error).message))
      .finally(() => setFetching(false));
  }, [bookingFromStore, dispatch, id]);

  const handleStartConsultation = async () => {
    if (!booking) return;
    setStarting(true);
    setActionError(null);
    try {
      const { consultation } = await consultationsApi.startOrResume(booking.id);
      navigate(`/consultation/${consultation.id}`);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setStarting(false);
    }
  };

  const handleConfirm = async () => {
    if (!booking) return;
    setConfirming(true);
    setActionError(null);
    try {
      const updated = await bookingsApi.updateStatus(booking.id, "confirmed");
      setBooking(updated);
      dispatch(updateBookingStatus({ id: booking.id, status: "confirmed" }));
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setConfirming(false);
    }
  };

  if (loading || fetching) {
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
        <p role="alert">{error ?? actionError ?? "Booking not found."}</p>
        <Link to="/bookings">
          <Button variant="secondary">Back to Bookings</Button>
        </Link>
      </div>
    );
  }

  const isCustomer = user?.role === "customer";
  const isPsychic = user?.role === "psychic";
  const canStart =
    (isCustomer || isPsychic) &&
    booking.status !== "canceled" &&
    booking.status !== "completed";
  const canConfirm = isPsychic && booking.status === "pending";

  return (
    <div className="page">
      <Card
        title={isCustomer ? "Your Booking" : "Session request"}
        subtitle={isPsychic ? "Review and confirm before the live chat" : undefined}
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
              <span>{booking.customerName || "—"}</span>
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

          {booking.notes && (
            <div className="booking-detail__notes">
              <span className="booking-detail__label">Notes</span>
              <p>{booking.notes}</p>
            </div>
          )}

          {actionError && <p role="alert">{actionError}</p>}

          <div className="booking-detail__actions">
            {canConfirm && (
              <Button variant="secondary" loading={confirming} onClick={handleConfirm}>
                Confirm appointment
              </Button>
            )}
            {canStart && (
              <Button
                variant="primary"
                loading={starting}
                disabled={starting}
                onClick={handleStartConsultation}
              >
                {starting ? "Starting…" : isPsychic ? "Join live session" : "Start consultation"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
