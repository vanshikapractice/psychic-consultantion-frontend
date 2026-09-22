import { useState, useEffect } from "react";
import { Avatar, Badge, Button, Card, Input, Textarea } from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectAuthUser, selectAuthLoading, selectAuthError } from "../store";
import { selectPsychicLoading, selectPsychicError } from "../store";
import { SPECIALTIES } from "../types";
import type { Psychic } from "../types";

export function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const authLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const psychicLoading = useAppSelector(selectPsychicLoading);
  const psychicError = useAppSelector(selectPsychicError);

  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const isPsychic = user?.role === "psychic";
  const loading = isPsychic ? psychicLoading : authLoading;
  const error = isPsychic ? psychicError : authError;

  // Customer fields
  const [name, setName] = useState(user?.name ?? "");
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? "");

  // Psychic fields
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [rate, setRate] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(user?.name ?? "");
    setProfileImage(user?.profileImage ?? "");

    if (isPsychic) {
      const psychic = user as Psychic | null;
      if (psychic) {
        setBio(psychic.bio ?? "");
        setSpecialties(psychic.specialties ?? []);
        setRate(psychic.rate ? String(psychic.rate) : "");
        setYearsOfExperience(
          psychic.yearsOfExperience ? String(psychic.yearsOfExperience) : ""
        );
      }
    }
  }, [user, isPsychic]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    if (isPsychic) {
      dispatch({
        type: "psychics/updateProfile",
        payload: {
          id: user.id,
          name,
          bio,
          specialties,
          rate: rate ? Number(rate) : undefined,
          yearsOfExperience: yearsOfExperience
            ? Number(yearsOfExperience)
            : undefined,
          profileImage,
        },
      });
      setSuccess("Professional profile updated.");
      setEditing(false);
    } else {
      dispatch({
        type: "auth/updateProfile",
        payload: { name, profileImage },
      });
      setSuccess("Profile updated.");
      setEditing(false);
    }
  };

  const handleLogout = () => {
    dispatch({ type: "auth/logout" });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  return (
    <div className="page">
      <Card
        title="My Profile"
        subtitle={
          isPsychic
            ? "Manage your professional profile"
            : "Manage your account details"
        }
      >
        <div className="profile">
          <div className="profile__avatar">
            <Avatar
              src={user.profileImage}
              alt={user.name}
              name={user.name}
              size="xl"
            />
          </div>

          <div className="profile__info">
            <div className="profile__field">
              <span className="profile__label">Name</span>
              <span>{user.name}</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="profile__field">
              <span className="profile__label">Role</span>
              <Badge variant={isPsychic ? "primary" : "info"}>
                {user.role}
              </Badge>
            </div>
            <div className="profile__field">
              <span className="profile__label">Member Since</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>

            {isPsychic && (
              <>
                <div className="profile__field">
                  <span className="profile__label">Bio</span>
                  <span>{(user as Psychic).bio || "No bio yet."}</span>
                </div>
                <div className="profile__field">
                  <span className="profile__label">Rate</span>
                  <span>
                    {(user as Psychic).rate
                      ? `$${(user as Psychic).rate}/min`
                      : "Not set"}
                  </span>
                </div>
                <div className="profile__field">
                  <span className="profile__label">Years of Experience</span>
                  <span>
                    {(user as Psychic).yearsOfExperience || 0} years
                  </span>
                </div>
                <div className="profile__field">
                  <span className="profile__label">Specialties</span>
                  <div className="profile__specialties">
                    {(user as Psychic).specialties?.map((s) => (
                      <Badge key={s} variant="primary" size="sm">
                        {s}
                      </Badge>
                    ))}
                    {!(user as Psychic).specialties?.length && (
                      <span>No specialties set</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="profile__actions">
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {editing && (
          <form onSubmit={handleSubmit} className="profile__edit-form">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <Input
              label="Profile Image URL"
              placeholder="https://example.com/image.jpg"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              disabled={loading}
            />

            {isPsychic && (
              <>
                <Textarea
                  label="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                  placeholder="Write a brief bio about yourself and your approach..."
                  rows={4}
                />

                <div className="profile__specialties-edit">
                  <label className="field__label">Specialties</label>
                  <div className="tag-list">
                    {SPECIALTIES.map((s) => {
                      const isSelected = specialties.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`tag ${isSelected ? "tag--selected" : ""}`}
                          onClick={() => handleSpecialtyToggle(s)}
                          disabled={loading}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Rate (per minute)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 3.50"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  disabled={loading}
                />

                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  disabled={loading}
                />
              </>
            )}

            {error && <p role="alert">{error}</p>}
            {success && <p className="profile__success">{success}</p>}
            <div className="profile__form-actions">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {loading ? "Saving…" : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
