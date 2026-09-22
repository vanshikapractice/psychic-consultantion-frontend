import { BookingList } from "../components/bookings";
import { useAppSelector } from "../store/hooks";
import { selectAuthUser } from "../store";

export function Bookings() {
  const user = useAppSelector(selectAuthUser);
  const isPsychic = user?.role === "psychic";

  return (
    <div className="page">
      <h1>{isPsychic ? "My Sessions" : "My Bookings"}</h1>
      <p className="page__lead">
        {isPsychic
          ? "Confirm requests and start live consultations with your clients."
          : "Manage appointments and start your live consultation when ready."}
      </p>
      <BookingList />
    </div>
  );
}
