import { useEffect } from "react";
import { PsychicCard } from "./PsychicCard";
import { PsychicFilter } from "./PsychicFilter";
import { Button, Spinner } from "../ui";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  selectFilteredPsychics,
  selectPsychicLoading,
  selectPsychicError,
  setPsychicFilter,
  resetFilter,
  type PsychicsFilter,
} from "../../store";
import type { Psychic } from "../../types";

export function PsychicList() {
  const dispatch = useAppDispatch();
  const psychics = useAppSelector(selectFilteredPsychics);
  const loading = useAppSelector(selectPsychicLoading);
  const error = useAppSelector(selectPsychicError);
  const currentFilter = useAppSelector((state) => state.psychics.filter) as PsychicsFilter;

  const handleSearchChange = (value: string) => {
    dispatch(setPsychicFilter({ search: value }));
  };

  const handleFilterChange = (next: Partial<PsychicsFilter>) => {
    dispatch(setPsychicFilter(next));
  };

  const handleReset = () => {
    dispatch(resetFilter());
  };

  useEffect(() => {
    dispatch({ type: "psychics/fetch" });
  }, [dispatch, currentFilter.specialty, currentFilter.minRating, currentFilter.maxRate]);

  return (
    <div className="psychic-list">
      <div className="psychic-list__search">
        <input
          type="search"
          placeholder="Search psychics..."
          value={currentFilter.search ?? ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-bar__input"
        />
      </div>

      <PsychicFilter
        active={currentFilter}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      {error && (
        <div className="state-container">
          <Spinner />
          <p role="alert">{error}</p>
          <Button variant="secondary" onClick={() => dispatch({ type: "psychics/fetch" })}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && psychics.length === 0 && (
        <div className="state-container">
          <p>No psychics found with the current filters.</p>
          <Button variant="outline" onClick={handleReset}>
            Clear Filters
          </Button>
        </div>
      )}

      {loading && (
        <div className="state-container">
          <Spinner size="lg" />
          <p>Finding your guides…</p>
        </div>
      )}

      {!loading && !error && psychics.length > 0 && (
        <div className="psychic-grid">
          {psychics.map((p: Psychic) => (
            <PsychicCard key={p.id} psychic={p} />
          ))}
        </div>
      )}
    </div>
  );
}
