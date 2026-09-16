import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { selectAuthError } from "../../store/selectors/authSelectors";
import { useAppSelector } from "../../store/hooks";
import { Button, Input, Select } from "../ui";
import type { RegisterRequest, Role } from "../../types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const [values, setValues] = useState<Omit<RegisterRequest, "role"> & {
    role: Role;
  }>({ name: "", email: "", password: "", role: "customer" });
  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterRequest, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authError = useAppSelector(selectAuthError);

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
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    dispatch({
      type: "auth/register",
      payload: values,
    });
    navigate("/");
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
          value={values.role}
          onChange={(e) => handleChange("role", e.target.value as Role)}
          options={[
            { value: "customer", label: "Seeker – I want to book readings" },
            { value: "psychic", label: "Psychic – I offer readings" },
          ]}
          required
        />

        <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
          {submitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <p className="auth-form__footer">
        Already have an account?{" "}
        <Link to="/register" className="auth-form__link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
