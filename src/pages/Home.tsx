import { PsychicList } from "../components/psychics";
import { Badge } from "../components/ui";

export function Home() {
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
            <Badge variant="warning">Anonymous</Badge>
          </div>
        </div>
      </section>

      <section className="page__section">
        <h2>Available Psychics</h2>
        <PsychicList />
      </section>
    </div>
  );
}
