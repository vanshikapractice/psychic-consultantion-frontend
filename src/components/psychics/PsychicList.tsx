import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { Link } from "react-router-dom";
import { Badge, Card, SearchBar } from "../ui";
import { PsychicFilter } from "./PsychicFilter";
import type { PsychicsFilter } from "../../types";

interface PsychicsListProps {
  showSearch?: boolean;
  showFilter?: boolean;
}

const PsychicsList: React.FC<PsychicsListProps> = ({
  showSearch = false,
  showFilter = false,
}: PsychicsListProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const { psychics, loading, error } = useSelector(
    (state: RootState) => state.psychics
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<PsychicsFilter>({
    search: "",
    specialty: undefined,
    minRating: undefined,
    maxRate: undefined,
  });

  useEffect(() => {
    dispatch({
      type: "psychics/fetch",
      payload: {
        specialty: activeFilter.specialty,
        minRating: activeFilter.minRating,
        maxRate: activeFilter.maxRate,
      },
    });
  }, [dispatch, activeFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filtered = searchTerm
    ? psychics.filter((psychic) => {
        const term = searchTerm.toLowerCase();
        const specialties = Array.isArray(psychic.specialties)
          ? psychic.specialties
          : [];
        return (
          psychic.name.toLowerCase().includes(term) ||
          specialties.some((s) => s.toLowerCase().includes(term)) ||
          psychic.email.toLowerCase().includes(term)
        );
      })
    : psychics;

  // Loading state
  if (loading) {
    return (
      <div className="state-container">
        <p>Loading psychics...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="state-container">
        <p role="alert">{error}</p>
        <button onClick={() => dispatch({ type: "psychics/fetch" })}>Retry</button>
      </div>
    );
  }

  // Empty state
  if (!psychics || psychics.length === 0) {
    return (
      <div className="state-container">
        <p>No psychics found.</p>
        <button onClick={() => dispatch({ type: "psychics/fetch" })}>Refresh</button>
      </div>
    );
  }

  return (
    <div className="psychics-container">
      {showSearch && (
        <div className="psychics-container__search">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            placeholder="Search by name, specialty, or email…"
          />
        </div>
      )}

      {showFilter && (
        <div className="psychics-container__filter">
          <PsychicFilter
            active={activeFilter}
            onChange={(partial) =>
              setActiveFilter((prev) => ({ ...prev, ...partial }))
            }
            onReset={() =>
              setActiveFilter({
                search: "",
                specialty: undefined,
                minRating: undefined,
                maxRate: undefined,
              })
            }
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="state-container">
          No psychics match your search or filters.
        </p>
      ) : (
        <div className="psychics-grid">
          {filtered.map((psychic) => (
            <Link
              key={psychic.id}
              to={`/psychic/${psychic.id}`}
              className="psychic-card-link"
            >
              <Card hover className="psychic-card">
                <div className="psychic-card__header">
                  <img
                    src={
                      psychic.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(psychic.name)}`
                    }
                    alt={psychic.name}
                    className="psychic-card__avatar"
                  />
                  <div className="psychic-card__info">
                    <h3>{psychic.name}</h3>
                    <div className="psychic-card__meta">
                      {psychic.specialties?.map((s: string) => (
                        <Badge key={s} variant="primary" size="sm">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="psychic-card__details">
                  <div className="psychic-card__rating">
                    <span>⭐ {psychic.rating ?? "—"}</span>
                    <span>({psychic.reviewCount ?? 0} reviews)</span>
                  </div>
                  <div className="psychic-card__rate">
                    ${psychic.rate ?? 0}/min
                  </div>
                  <Badge
                    variant={
                      psychic.status === "online" ? "success" : "neutral"
                    }
                    size="sm"
                  >
                    {psychic.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export { PsychicsList };