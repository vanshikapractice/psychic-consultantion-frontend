import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { selectAuthError } from "../../store/selectors/authSelectors";
import { useAppSelector } from "../../store/hooks";
import { Button, Input } from "../ui";
import type { LoginRequest } from "../../types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const [values, setValues] = useState<LoginRequest>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginRequest, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authError = useAppSelector(selectAuthError);

  const handleChange = (field: keyof LoginRequest, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof LoginRequest, string>> = {};
    if (!values.email) next.email = "Email is required.";
    else if (!emailRegex.test(values.email)) next.email = "Enter a valid email.";
    if (!values.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    dispatch({ type: "auth/login", payload: values });
    navigate("/");
  };

  return (
    <div className="auth-form">
      <h2>Welcome Back</h2>
      <p className="auth-form__subtitle">Sign in to continue your journey</p>

      {authError && (
        <div className="auth-form__error" role="alert">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form__body">
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
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onChange={(e) => handleChange("password", e.target.value)}
          autoComplete="current-password"
          required
        />

        <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="auth-form__footer">
        New to the platform?{" "}
        <Link to="/register" className="auth-form__link">
          Create an account
        </Link>
      </p>
    </div>
  );
}
