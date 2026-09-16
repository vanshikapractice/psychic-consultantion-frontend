import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Select } from "../ui";
import { useAppDispatch } from "../../store/hooks";
import type { Psychic } from "../../types";

interface BookingFormProps {
  psychic: Psychic;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export function BookingForm({ psychic }: BookingFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !time) {
      setError("Please select a date and time.");
      return;
    }

    const dateTime = new Date(`${date}T${time}`).toISOString();
    const now = Date.now();
    if (new Date(dateTime).getTime() <= now) {
      setError("Please select a future date and time.");
      return;
    }

    setSubmitting(true);
    dispatch({
      type: "bookings/create",
      payload: { psychicId: psychic.id, dateTime, duration: Number(duration) },
    });
    navigate("/bookings");
  };

  const estimatedCost = (Number(duration) * psychic.rate).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h3>Book a Session with {psychic.name}</h3>
      <p className="booking-form__rate">
        ${psychic.rate.toFixed(2)}/min • Est. cost: ${estimatedCost}
      </p>

      {error && (
        <div className="auth-form__error" role="alert">
          {error}
        </div>
      )}

      <div className="booking-form__grid">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
        />
        <Input
          label="Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>

      <Select
        label="Duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        options={DURATION_OPTIONS.map((d) => ({
          value: String(d),
          label: `${d} min`,
        }))}
        required
      />

      <Button
        type="submit"
        variant="primary"
        loading={submitting}
        disabled={submitting}
      >
        {submitting ? "Booking…" : `Confirm Booking ($${estimatedCost})`}
      </Button>
    </form>
  );
}
