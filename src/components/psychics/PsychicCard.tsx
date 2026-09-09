import { Link } from "react-router-dom";
import { Avatar, Badge, Button, Rating } from "../ui";
import type { Psychic } from "../../types";
import { SPECIALTIES } from "../../types";

export interface PsychicCardProps {
  psychic: Psychic;
}

export function PsychicCard({ psychic }: PsychicCardProps) {
  const primarySpecialty = psychic.specialties[0] ?? "General";
  const otherSpecialties = psychic.specialties.slice(1);

  return (
    <Link to={`/psychic/${psychic.id}`} className="psychic-card">
      <div className="psychic-card__image">
        <Avatar
          src={psychic.profileImage}
          alt={psychic.name}
          name={psychic.name}
          size="xl"
        />
      </div>

      <div className="psychic-card__body">
        <div className="psychic-card__header">
          <h3 className="psychic-card__name">{psychic.name}</h3>
          <Badge variant="primary" size="sm">
            {primarySpecialty}
          </Badge>
        </div>

        {otherSpecialties.length > 0 && (
          <div className="psychic-card__specialties">
            {otherSpecialties.map((s) => (
              <Badge key={s} variant="neutral" size="sm">
                {s}
              </Badge>
            ))}
          </div>
        )}

        <p className="psychic-card__bio">{psychic.bio}</p>

        <div className="psychic-card__stats">
          <div className="psychic-card__rating">
            <Rating value={psychic.rating} readOnly size="sm" showValue />
          </div>
          <span className="psychic-card__reviews">
            ({psychic.reviewCount} reviews)
          </span>
        </div>

        <div className="psychic-card__footer">
          <div className="psychic-card__rate">
            <span className="psychic-card__rate-value">${psychic.rate.toFixed(2)}</span>
            <span className="psychic-card__rate-label">per min</span>
          </div>
          <Badge variant="info">{psychic.yearsOfExperience} yrs exp</Badge>
        </div>
      </div>

      <div className="psychic-card__cta">
        <Button variant="primary" size="sm">
          View Profile
        </Button>
      </div>
    </Link>
  );
}

export { SPECIALTIES };
