import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectAuthUser, selectAuthLoading } from "../store";
import { Spinner } from "../components/ui";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  if (loading) {
    return (
      <div className="state-container">
        <Spinner size="lg" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: ProtectedRouteProps) {
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectAuthLoading);

  if (loading) {
    return (
      <div className="state-container">
        <Spinner size="lg" />
        <p>Loading…</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
