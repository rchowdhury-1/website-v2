import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../apiClient";

function Billing() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const paymentSuccess = searchParams.get("success") === "1";
  const paymentCanceled = searchParams.get("canceled") === "1";

  useEffect(() => {
    apiRequest("/auth/me")
      .then(setUser)
      .catch((err) => {
        console.error(err);
        setMessage("Failed to load billing info.");
      });
  }, []);

  const handleUpgrade = async () => {
    try {
      setStatus("upgrading");
      setMessage("");
      const data = await apiRequest("/billing/checkout", { method: "POST" });
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStatus("error");
        setMessage("No checkout URL returned.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err.message || "Upgrade failed.");
    }
  };

  if (!user) return <p style={{ padding: "24px" }}>Loading billing info…</p>;

  return (
    <div className="container" style={{ padding: "24px" }}>
      <h2>Billing</h2>

      <p>
        Current plan: <strong>{user.plan === "PRO" ? "Pro" : "Free"}</strong>
      </p>

      <p>
        Free plan: Manage up to 3 customers.<br />
        Pro plan: Unlimited customers and advanced features.
      </p>

      {paymentSuccess && (
        <div style={{ marginTop: "16px", padding: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
          <p style={{ color: "#15803d", margin: 0 }}>
            <strong>Payment received!</strong> Your plan is being upgraded — this usually takes a few seconds. Refresh the page to see your updated plan.
          </p>
        </div>
      )}

      {paymentCanceled && (
        <div style={{ marginTop: "16px", padding: "16px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: "8px" }}>
          <p style={{ color: "#854d0e", margin: 0 }}>Payment was cancelled. No charge was made.</p>
        </div>
      )}

      {user.plan !== "PRO" && !paymentSuccess && (
        <div style={{ marginTop: "16px" }}>
          <button onClick={handleUpgrade} disabled={status === "upgrading"}>
            {status === "upgrading" ? "Redirecting to Stripe…" : "Upgrade to Pro"}
          </button>
        </div>
      )}

      {user.plan === "PRO" && (
        <p style={{ color: "green", marginTop: "16px" }}>You are on the Pro plan 🎉</p>
      )}

      {message && (
        <p style={{ marginTop: "16px", color: status === "error" ? "crimson" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Billing;
