import { Button } from "../ui";
import { SPECIALTIES } from "../../types";
import type { PsychicsFilter } from "../../types";

interface PsychicFilterProps {
  active: PsychicsFilter;
  onChange: (filter: Partial<PsychicsFilter>) => void;
  onReset: () => void;
}

export function PsychicFilter({ active, onChange, onReset }: PsychicFilterProps) {
  const hasFilters =
    Boolean(active.specialty) ||
    active.minRating !== undefined ||
    active.maxRate !== undefined;

  const ratingOptions = [4.0, 4.5, 4.8, 0];

  return (
    <div className="psychic-filter">
      <div className="psychic-filter__section">
        <span className="psychic-filter__label">Specialty</span>
        <div className="tag-list">
          {SPECIALTIES.map((s) => {
            const isActive = active.specialty === s;
            return (
              <button
                key={s}
                type="button"
                className={`tag ${isActive ? "tag--selected" : ""}`}
                onClick={() =>
                  onChange({
                    specialty: isActive ? undefined : s,
                  })
                }
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="psychic-filter__section">
        <span className="psychic-filter__label">Min Rating</span>
        <div className="tag-list">
          {ratingOptions.map((r) => {
            const isActive = active.minRating === r;
            return (
              <button
                key={String(r)}
                type="button"
                className={`tag ${isActive ? "tag--selected" : ""}`}
                onClick={() => onChange({ minRating: isActive ? undefined : r })}
              >
                {r === 0 ? "All" : `≥ ${r}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="psychic-filter__section">
        <span className="psychic-filter__label">Max Rate</span>
        <div className="tag-list">
          {[2, 3, 5, 10].map((rate) => {
            const isActive = active.maxRate === rate;
            return (
              <button
                key={rate}
                type="button"
                className={`tag ${isActive ? "tag--selected" : ""}`}
                onClick={() => onChange({ maxRate: isActive ? undefined : rate })}
              >
                ${rate}
              </button>
            );
          })}
        </div>
      </div>

      {hasFilters && (
        <div className="psychic-filter__reset">
          <Button variant="outline" size="sm" onClick={onReset}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
