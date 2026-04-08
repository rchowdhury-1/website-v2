import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container">
        <div style={{ padding: "24px", background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.3)", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>📬</p>
          <h2 style={{ margin: "0 0 8px" }}>Check your email</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 16px" }}>
            If that email is registered, a password reset link has been sent. It expires in 1 hour.
          </p>
          <Link to="/login" className="btn btn-ghost">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Forgot password</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
        Enter your email and we'll send a reset link if an account exists.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      {error && <p style={{ color: "var(--danger)", marginTop: "10px" }}>{error}</p>}

      <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        <Link to="/login" style={{ color: "var(--accent-strong)" }}>Back to login</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;
