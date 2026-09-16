import { useState, useEffect } from "react";
import { Avatar, Badge, Button, Card, Input } from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectAuthUser, selectAuthLoading, selectAuthError } from "../store";

export function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? "");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setProfileImage(user?.profileImage ?? "");
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    dispatch({ type: "auth/updateProfile", payload: { name, profileImage } });
    setSuccess("Profile updated.");
    setEditing(false);
  };

  const handleLogout = () => {
    dispatch({ type: "auth/logout" });
  };

  return (
    <div className="page">
      <Card title="My Profile" subtitle="Manage your account details">
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
              <Badge variant={user.role === "psychic" ? "primary" : "info"}>
                {user.role}
              </Badge>
            </div>
            <div className="profile__field">
              <span className="profile__label">Member Since</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
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
              label="Name"
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
