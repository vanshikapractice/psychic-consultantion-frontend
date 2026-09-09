import { useState } from "react";
import { PsychicCard } from "./PsychicCard";
import { PsychicFilter } from "./PsychicFilter";
import { Button, Spinner } from "../ui";
import { usePsychics } from "../../hooks/usePsychics";
import type { Psychic, PsychicsFilter } from "../../types";

export function PsychicList() {
  const [filter, setFilter] = useState<PsychicsFilter>({ search: "" });

  const { data: psychics, loading, error, refetch } = usePsychics(filter);

  const handleSearchChange = (value: string) => {
    setFilter((prev) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (next: Partial<PsychicsFilter>) => {
    setFilter((prev) => ({ ...prev, ...next }));
  };

  const handleReset = () => {
    setFilter({ search: "" });
  };

  return (
    <div className="psychic-list">
      <div className="psychic-list__search">
        <input
          type="search"
          placeholder="Search psychics..."
          value={filter.search ?? ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-bar__input"
        />
      </div>

      <PsychicFilter
        active={filter}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      {error && (
        <div className="state-container">
          <Spinner />
          <p role="alert">{error.message}</p>
          <Button variant="secondary" onClick={refetch}>
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
