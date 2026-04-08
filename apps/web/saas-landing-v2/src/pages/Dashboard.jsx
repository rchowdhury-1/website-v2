import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { apiRequest } from "../apiClient";

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: "rgba(15, 23, 42, 0.96)",
      border: "1px solid rgba(148, 163, 184, 0.35)",
      borderRadius: "10px",
      padding: "20px 24px",
      minWidth: "160px",
      flex: "1",
    }}>
      <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>{label}</p>
      <p style={{ margin: "6px 0 4px", fontSize: "28px", fontWeight: 700, color: "var(--text)" }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "rgba(15,23,42,0.97)", border: "1px solid rgba(148,163,184,0.3)", borderRadius: "8px", padding: "8px 14px" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
          {payload[0].value} customer{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    apiRequest("/dashboard/stats")
      .then(setStats)
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  if (!stats) return <p style={{ padding: "24px", color: "var(--text-muted)" }}>Loading…</p>;

  const isPro = stats.plan === "PRO";
  const memberSince = new Date(stats.memberSince).toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });

  const maxVal = Math.max(...stats.monthlyData.map((d) => d.customers), 1);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>
      <h2>Dashboard</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
        Here's an overview of your account.
      </p>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "32px" }}>
        <StatCard
          label="Total customers"
          value={stats.totalCustomers}
          sub={isPro ? "Unlimited" : `${Math.max(0, 3 - stats.totalCustomers)} slots remaining`}
        />
        <StatCard
          label="Added this month"
          value={stats.customersThisMonth}
          sub="New customers"
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

      {/* Upgrade banner */}
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
          marginBottom: "32px",
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>You're on the Free plan</p>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--text-muted)" }}>
              {stats.totalCustomers >= 3
                ? "You've reached the 3 customer limit. Upgrade to add more."
                : `${3 - stats.totalCustomers} customer slot${3 - stats.totalCustomers === 1 ? "" : "s"} remaining.`}
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
          marginBottom: "32px",
        }}>
          <p style={{ margin: 0, color: "var(--success)", fontWeight: 600 }}>
            You're on the Pro plan 🎉 — unlimited customers and full access.
          </p>
        </div>
      )}

      {/* Monthly chart */}
      <div style={{
        background: "rgba(15, 23, 42, 0.96)",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: "10px",
        padding: "20px 24px",
        marginBottom: "24px",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--text-muted)" }}>Customers added</p>
        <p style={{ margin: "0 0 20px", fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>Last 6 months</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={stats.monthlyData} barCategoryGap="35%">
            <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
            <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
              {stats.monthlyData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.customers === maxVal && maxVal > 0 ? "#6366f1" : "rgba(99,102,241,0.4)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link to="/customers" className="btn btn-primary">Manage customers</Link>
        <Link to="/billing" className="btn btn-ghost">View billing</Link>
      </div>
    </div>
  );
}

export default Dashboard;
