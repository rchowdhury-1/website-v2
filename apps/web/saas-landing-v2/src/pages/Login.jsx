import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../apiClient";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const justVerified = searchParams.get("verified") === "true";
  const tokenError = searchParams.get("error");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowResend(false);
    setIsLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        setError("Please verify your email before logging in.");
        setShowResend(true);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await apiRequest("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
      });
      setResendSent(true);
    } catch {
      setResendSent(true); // Show success regardless
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Log in</h2>

      {justVerified && (
        <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", marginBottom: "16px" }}>
          <p style={{ margin: 0, color: "var(--success)", fontSize: "0.9rem" }}>
            Email verified successfully. You can now log in.
          </p>
        </div>
      )}

      {tokenError && (
        <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", marginBottom: "16px" }}>
          <p style={{ margin: 0, color: "var(--danger)", fontSize: "0.9rem" }}>
            {tokenError === "token_expired"
              ? "Verification link has expired. Please request a new one."
              : "Invalid verification link. Please request a new one."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Logging in…" : "Log in"}
        </button>
      </form>

      {error && (
        <p style={{ color: "var(--danger)", marginTop: "10px", fontSize: "0.9rem" }}>{error}</p>
      )}

      {showResend && !resendSent && (
        <button
          className="btn btn-ghost"
          style={{ marginTop: "8px", fontSize: "0.85rem" }}
          onClick={handleResend}
          disabled={resendLoading || !form.email}
        >
          {resendLoading ? "Sending…" : "Resend verification email"}
        </button>
      )}

      {resendSent && (
        <p style={{ color: "var(--success)", fontSize: "0.85rem", marginTop: "8px" }}>
          Verification email sent — check your inbox.
        </p>
      )}

      <div style={{ marginTop: "16px", fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "6px" }}>
        <span>
          <Link to="/forgot-password" style={{ color: "var(--accent-strong)" }}>Forgot password?</Link>
        </span>
        <span>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent-strong)" }}>Create one</Link>
        </span>
      </div>
    </div>
  );
}

export default Login;
