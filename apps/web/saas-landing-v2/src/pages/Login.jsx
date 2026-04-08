import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Log in</h2>

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

      {error && <p style={{ color: "var(--danger)", marginTop: "10px" }}>{error}</p>}

      <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "var(--accent-strong)" }}>Create one</Link>
      </p>
    </div>
  );
}

export default Login;
