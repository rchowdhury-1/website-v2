import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "20px 24px",
      minWidth: "160px",
    }}>
      <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>{label}</p>
      <p style={{ margin: "6px 0 4px", fontSize: "28px", fontWeight: 700 }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>{sub}</p>}
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [customerCount, setCustomerCount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/auth/me"),
      apiRequest("/customers"),
    ])
      .then(([userData, customers]) => {
        setUser(userData);
        setCustomerCount(customers.length);
      })
      .catch((err) => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  if (!user) return <p style={{ padding: "24px" }}>Loading…</p>;

  const isPro = user.plan === "PRO";
  const customerLimit = isPro ? "Unlimited" : "3 max";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="container" style={{ padding: "24px" }}>
      <h2>Dashboard</h2>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Welcome back, <strong>{user.name || user.email}</strong>
      </p>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
        <StatCard
          label="Customers"
          value={customerCount}
          sub={customerLimit}
        />
        <StatCard
          label="Current plan"
          value={isPro ? "Pro" : "Free"}
          sub={isPro ? "Unlimited access" : "Upgrade for more"}
        />
        <StatCard
          label="Member since"
          value={memberSince}
        />
      </div>

      {!isPro && (
        <div style={{
          padding: "16px 20px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>You're on the Free plan</p>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
              {customerCount >= 3
                ? "You've reached the 3 customer limit. Upgrade to add more."
                : `${3 - customerCount} customer slot${3 - customerCount === 1 ? "" : "s"} remaining.`}
            </p>
          </div>
          <Link to="/billing" className="btn btn-primary btn-small">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {isPro && (
        <div style={{
          padding: "16px 20px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
        }}>
          <p style={{ margin: 0, color: "#15803d", fontWeight: 600 }}>
            You're on the Pro plan 🎉 — unlimited customers and full access.
          </p>
        </div>
      )}

      <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/customers" className="btn btn-primary">Manage customers</Link>
        <Link to="/billing" className="btn btn-ghost">View billing</Link>
      </div>
    </div>
  );
}

export default Dashboard;
