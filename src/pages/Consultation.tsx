import { useCallback, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Spinner } from "../components/ui";
import { ConsultationSummary } from "../components/consultations";
import { ConsultationChat } from "../features/consultation-chat";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectAuthUser } from "../store";
import {
  selectActiveConsultation,
  selectConsultationLoading,
  selectConsultationError,
  selectIsRunning,
  selectElapsed,
  selectFormattedDuration,
  incrementElapsed,
} from "../store";
import { bookingsApi } from "../api";
import { setActiveConsultation } from "../store";
import { formatCurrency } from "../utils/dateFormat";

export function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const consultation = useAppSelector(selectActiveConsultation);
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectConsultationLoading);
  const error = useAppSelector(selectConsultationError);
  const isRunning = useAppSelector(selectIsRunning);
  const elapsed = useAppSelector(selectElapsed);
  const formattedDuration = useAppSelector(selectFormattedDuration);

  const isPsychic = user?.role === "psychic";
  const isCustomer = user?.role === "customer";

  useEffect(() => {
    if (id) {
      dispatch({ type: "consultations/fetch", payload: id });
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (!consultation?.bookingId) return;
    if (consultation.customerName && consultation.psychicName) return;
    bookingsApi
      .get(consultation.bookingId)
      .then((booking) => {
        dispatch(
          setActiveConsultation({
            ...consultation,
            customerName: booking.customerName,
            psychicName: booking.psychicName,
            notes: booking.notes,
            rate: booking.rate || booking.pricePerMinute,
            totalPrice: consultation.totalPrice || booking.totalPrice,
          })
        );
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultation?.id, consultation?.bookingId, dispatch]);

  useEffect(() => {
    if (!isRunning || consultation?.status !== "active") return;
    const timer = window.setInterval(() => {
      dispatch(incrementElapsed());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [dispatch, isRunning, consultation?.status]);

  const handleEndSession = useCallback(() => {
    if (!consultation) return;
    const estimated = consultation.rate > 0 ? (elapsed / 60) * consultation.rate : consultation.totalPrice;
    dispatch({
      type: "consultations/end",
      payload: {
        consultationId: consultation.id,
        transcript: "Live consultation completed via PsychicConnect.",
        finalAmount: Number(estimated.toFixed(2)) || undefined,
      },
    });
  }, [consultation, dispatch, elapsed]);

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
        <Link to={isPsychic ? "/psychic/dashboard" : "/bookings"}>
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="state-container">
        <p>Consultation not found.</p>
        <Link to={isPsychic ? "/psychic/dashboard" : "/bookings"}>
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
    );
  }

  if (consultation.status === "completed") {
    return (
      <div className="page">
        <ConsultationSummary consultation={consultation} />
        {isCustomer && (
          <div className="mt-4">
            <Link to={`/review/${consultation.id}`}>
              <Button variant="primary">Leave a Review</Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  const peerName = isPsychic
    ? consultation.customerName ?? `Customer #${consultation.customerId}`
    : consultation.psychicName;
  const sessionCost =
    consultation.rate > 0
      ? (elapsed / 60) * consultation.rate
      : consultation.totalPrice;

  return (
    <div className={`consultation-room ${isPsychic ? "consultation-room--psychic" : "consultation-room--customer"}`}>
      <aside className="consultation-room__sidebar">
        <div className="consultation-room__sidebar-inner">
          <Badge variant={isPsychic ? "info" : "success"}>
            {isPsychic ? "Psychic session" : "Customer session"}
          </Badge>
          <h1 className="consultation-room__title">
            {isPsychic ? "Reading for" : "Connected with"}
          </h1>
          <p className="consultation-room__peer">{peerName}</p>

          <div className="consultation-room__meta">
            <div>
              <span className="consultation-room__label">Duration</span>
              <span className="consultation-room__timer">{formattedDuration}</span>
            </div>
            <div>
              <span className="consultation-room__label">Est. cost</span>
              <span>{formatCurrency(sessionCost)}</span>
            </div>
            <div>
              <span className="consultation-room__label">Status</span>
              <Badge variant="success">{isRunning ? "Live" : "Paused"}</Badge>
            </div>
          </div>

          <div className="consultation-room__actions">
            <Button
              variant="danger"
              size="sm"
              disabled={!isRunning}
              onClick={handleEndSession}
            >
              End session
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(isPsychic ? "/psychic/dashboard" : "/bookings")}
            >
              Leave room
            </Button>
          </div>

          {isPsychic && consultation.notes && (
            <div className="consultation-room__notes">
              <span className="consultation-room__label">Customer notes</span>
              <p>{consultation.notes}</p>
            </div>
          )}
        </div>
      </aside>

      <section className="consultation-room__chat">
        {user && (
          <ConsultationChat
            consultationId={consultation.id}
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              profileImage: user.profileImage,
            }}
            psychicName={isCustomer ? consultation.psychicName : undefined}
            customerName={isPsychic ? peerName : undefined}
            consultationStatus={consultation.status}
            variant={isPsychic ? "psychic" : "customer"}
          />
        )}
      </section>
    </div>
  );
}
