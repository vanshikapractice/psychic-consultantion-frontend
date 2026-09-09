import { Link } from "react-router-dom";
import { Button } from "../components/ui";

export function NotFound() {
  return (
    <div className="state-container state-container--tall">
      <h1 className="not-found__title">404</h1>
      <p className="not-found__subtitle">Page not found</p>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/">
        <Button variant="primary">Go Home</Button>
      </Link>
    </div>
  );
}
