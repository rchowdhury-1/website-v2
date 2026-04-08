import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../apiClient";

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.96)",
      border: "1px solid rgba(148, 163, 184, 0.35)",
      borderRadius: "10px",
      padding: "20px 24px",
      minWidth: "160px",
    }}>
      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>{label}</p>
      <p style={{ margin: "6px 0 4px", fontSize: "28px", fontWeight: 700, color: "var(--text)" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [customerCount, setCustomerCount] = useState(null);

  useEffect(() => {
    Promise.all([
      apiRequest("/auth/me"),
      apiRequest("/customers"),
    ])
      .then(([userData, customers]) => {
        setUser(userData);
        setCustomerCount(customers.length);
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  if (!user) return <p style={{ padding: "24px", color: "var(--text-muted)" }}>Loading…</p>;

  const isPro = user.plan === "PRO";
  const customerLimit = isPro ? "Unlimited" : "3 max";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="container" style={{ padding: "24px" }}>
      <h2>Dashboard</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
        Welcome back, <strong style={{ color: "var(--text)" }}>{user.name || user.email}</strong>
      </p>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
        <StatCard label="Customers" value={customerCount} sub={customerLimit} />
        <StatCard label="Current plan" value={isPro ? "Pro" : "Free"} sub={isPro ? "Unlimited access" : "Upgrade for more"} />
        <StatCard label="Member since" value={memberSince} />
      </div>

      {!isPro && (
        <div style={{
          padding: "16px 20px",
          background: "rgba(79, 70, 229, 0.1)",
          border: "1px solid rgba(79, 70, 229, 0.4)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>You're on the Free plan</p>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--text-muted)" }}>
              {customerCount >= 3
                ? "You've reached the 3 customer limit. Upgrade to add more."
                : `${3 - customerCount} customer slot${3 - customerCount === 1 ? "" : "s"} remaining.`}
            </p>
          </div>
          <Link to="/billing" className="btn btn-primary btn-small">Upgrade to Pro</Link>
        </div>
      )}

      {isPro && (
        <div style={{
          padding: "16px 20px",
          background: "rgba(34, 197, 94, 0.08)",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          borderRadius: "8px",
        }}>
          <p style={{ margin: 0, color: "var(--success)", fontWeight: 600 }}>
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
