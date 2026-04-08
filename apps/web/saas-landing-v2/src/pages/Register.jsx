import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const data = await apiRequest("/auth/register", {
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
