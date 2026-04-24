import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert, Button, Input } from "../components/UI";
import { useAuth } from "../context/useAuth";
import "./Login.css";

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (mode === "register" && !form.name.trim())
      errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "At least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate("/dashboard");
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setApiError("");
    setErrors({});
  };

  return (
    <div className="login-page">
      <div className="login-box fade-in">
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 18c0-4 3-6 9-6s9 2 9 6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M12 4L6 10h12L12 4z" fill="#fff" opacity="0.8" />
            </svg>
          </div>
          <h1 className="login-title">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="login-subtitle">
            {mode === "login"
              ? "Sign in to your store dashboard"
              : "Get started with FreshStore"}
          </p>
        </div>

        {/* Card */}
        <div className="login-card">
          {apiError && (
            <div className="login-alert-wrap">
              <Alert variant="danger">{apiError}</Alert>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <Input
                label="Full name"
                type="text"
                placeholder="Jane Wanjiku"
                value={form.name}
                onChange={set("name")}
                error={errors.name}
                autoFocus
              />
            )}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              autoFocus={mode === "login"}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              hint={mode === "register" ? "At least 6 characters" : undefined}
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="login-submit-btn"
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </div>

        {/* Switch */}
        <p className="login-switch">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button className="login-switch-btn" onClick={switchMode}>
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
