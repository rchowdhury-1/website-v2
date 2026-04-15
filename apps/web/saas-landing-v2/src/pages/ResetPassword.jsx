import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="container">
        <p style={{ color: "var(--danger)" }}>Invalid reset link. Please request a new one.</p>
        <Link to="/forgot-password" style={{ color: "var(--accent-strong)" }}>Request reset link</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div style={{ padding: "24px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>✅</p>
          <h2 style={{ margin: "0 0 8px" }}>Password reset</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 16px" }}>
            Your password has been updated. You can now log in.
          </p>
          <Link to="/login" className="btn btn-primary">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Reset password</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Enter a new password for your account.</p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="password"
          placeholder="New password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      {error && <p style={{ color: "var(--danger)", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

export default ResetPassword;
