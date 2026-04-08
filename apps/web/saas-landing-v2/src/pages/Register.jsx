import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setRegistered(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="container">
        <div style={{ padding: "24px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>📧</p>
          <h2 style={{ margin: "0 0 8px" }}>Check your email</h2>
          <p style={{ color: "var(--text-muted)", margin: "0 0 16px" }}>
            We sent a verification link to <strong style={{ color: "var(--text)" }}>{form.email}</strong>.
            Click the link to activate your account.
          </p>
          <Link to="/login" className="btn btn-primary">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Create an account</h2>

      <form onSubmit={handleSubmit} className="form">
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
          disabled={isLoading}
        />
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
          placeholder="Password (min 8 characters)"
          onChange={handleChange}
          required
          minLength={8}
          disabled={isLoading}
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Creating account…" : "Create account"}
        </button>
      </form>

      {error && <p style={{ color: "var(--danger)", marginTop: "10px" }}>{error}</p>}

      <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--accent-strong)" }}>Log in</Link>
      </p>
    </div>
  );
}

export default Register;
