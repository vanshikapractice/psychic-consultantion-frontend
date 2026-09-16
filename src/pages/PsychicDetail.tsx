import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Avatar, Badge, Button, Card, Rating, Spinner } from "../components/ui";
import { BookingForm } from "../components/bookings";
import { ReviewList } from "../components/reviews";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectSelectedPsychic,
  selectPsychicLoading,
  selectPsychicError,
} from "../store";
import { selectReviewLoading, selectReviews } from "../store/selectors/reviewSelectors";
import { formatCurrency } from "../utils/dateFormat";
import type { Psychic } from "../types";

export function PsychicDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const psychic = useAppSelector(selectSelectedPsychic) as Psychic | null;
  const loading = useAppSelector(selectPsychicLoading);
  const error = useAppSelector(selectPsychicError);
  const reviews = useAppSelector(selectReviews);
  const reviewsLoading = useAppSelector(selectReviewLoading);

  const [activeTab, setActiveTab] = useState<"about" | "reviews">("about");

  useEffect(() => {
    if (id) {
      dispatch({ type: "psychics/fetchOne", payload: id });
      dispatch({ type: "reviews/fetch", payload: id });
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="state-container">
        <Spinner size="lg" />
        <p>Loading psychic profile…</p>
      </div>
    );
  }

  if (error || !psychic) {
    return (
      <div className="state-container">
        <p role="alert">{error ?? "Psychic not found."}</p>
        <Button variant="secondary" onClick={() => dispatch({ type: "psychics/fetchOne", payload: id ?? "" })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="page page--psychic-detail">
      <div className="psychic-detail__grid">
        <div className="psychic-detail__main">
          <Card>
            <div className="psychic-detail__header">
              <Avatar
                src={psychic.profileImage}
                alt={psychic.name}
                name={psychic.name}
                size="xl"
              />
              <div className="psychic-detail__info">
                <h1>{psychic.name}</h1>
                <div className="psychic-detail__rating">
                  <Rating value={psychic.rating} readOnly showValue />
                  <span className="psychic-detail__review-count">
                    ({psychic.reviewCount} reviews)
                  </span>
                </div>
                <div className="psychic-detail__rate">
                  <span className="psychic-detail__rate-value">
                    {formatCurrency(psychic.rate)}
                  </span>
                  <span className="psychic-detail__rate-label">per minute</span>
                </div>
              </div>
            </div>

            <div className="psychic-detail__specialties">
              {psychic.specialties.map((s) => (
                <Badge key={s} variant="primary">{s}</Badge>
              ))}
            </div>

            <p className="psychic-detail__bio">{psychic.bio}</p>

            <div className="psychic-detail__meta">
              <Badge variant="info">{psychic.yearsOfExperience} years experience</Badge>
            </div>
          </Card>
        </div>

        <div className="psychic-detail__sidebar">
          <Card title="Book a Session">
            <BookingForm psychic={psychic} />
          </Card>
        </div>
      </div>

      <section className="psychic-detail__tabs">
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === "about" ? "tab--active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "reviews" ? "tab--active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({psychic.reviewCount})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "about" && (
            <Card>
              <div className="psychic-bio">
                <h3>Background</h3>
                <p>{psychic.bio}</p>
                <h3>Specialties</h3>
                <ul>
                  {psychic.specialties.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
          {activeTab === "reviews" && (
            reviewsLoading ? (
              <div className="state-container">
                <Spinner size="md" />
                <p>Loading reviews…</p>
              </div>
            ) : (
              <ReviewList reviews={reviews} psychicName={psychic.name} />
            )
          )}
        </div>
      </section>
    </div>
  );
}
