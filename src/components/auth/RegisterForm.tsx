import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Select } from "../ui";
import { useAuth } from "../../hooks/useAuth";
import { rolesApi } from "../../api";
import type { RegisterRequest, RoleRecord } from "../../types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = Omit<RegisterRequest, "role_id"> & { role_id: string };

export function RegisterForm() {
  const [values, setValues] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterRequest, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    rolesApi
      .getRoles()
      .then((fetchedRoles) => {
        setRoles(fetchedRoles);
        if (fetchedRoles.length > 0) {
          setValues((prev) => ({ ...prev, role_id: String(fetchedRoles[0].id) }));
        }
      })
      .catch((err) => {
        setRolesError(
          err instanceof Error ? err.message : "Failed to load roles."
        );
      })
      .finally(() => {
        setRolesLoading(false);
      });
  }, []);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegisterRequest])
      setErrors((prev) => ({ ...prev, [field as keyof RegisterRequest]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof RegisterRequest, string>> = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!values.email) next.email = "Email is required.";
    else if (!emailRegex.test(values.email)) next.email = "Enter a valid email.";
    if (!values.password) next.password = "Password is required.";
    else if (values.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (!values.role_id) next.role_id = "Please select a role.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: RegisterRequest = {
        name: values.name,
        email: values.email,
        password: values.password,
        role_id: Number(values.role_id),
      };

      await register(payload);
      navigate("/");
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Create Your Account</h2>
      <p className="auth-form__subtitle">
        Join thousands of seekers and advisors
      </p>

      {authError && (
        <div className="auth-form__error" role="alert">
          {authError}
        </div>
      )}

      {rolesError && (
        <div className="auth-form__error" role="alert">
          {rolesError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form__body">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          value={values.name}
          error={errors.name}
          onChange={(e) => handleChange("name", e.target.value)}
          autoComplete="name"
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => handleChange("email", e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={values.password}
          error={errors.password}
          onChange={(e) => handleChange("password", e.target.value)}
          autoComplete="new-password"
          required
        />
        <Select
          label="I am a..."
          value={values.role_id}
          onChange={(e) => handleChange("role_id", e.target.value)}
          options={roles.map((role) => ({
            value: String(role.id),
            label: role.name,
          }))}
          placeholder={rolesLoading ? "Loading roles…" : undefined}
          disabled={rolesLoading}
          error={errors.role_id}
          required
        />

        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={submitting || rolesLoading || !!rolesError}
        >
          {submitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="auth-form__footer">
        Already have an account?{" "}
        <Link to="/login" className="auth-form__link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
