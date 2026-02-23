import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../apiClient";

function Billing() {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | upgrading | success | error
  const [message, setMessage] = useState("");

  // Load current user (plan)
  useEffect(() => {
    apiRequest("/auth/me")
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        console.error(err);
        setMessage("Failed to load user info.");
      });
  }, []);

  // If success=1 in URL, call /billing/upgrade to mark PRO (demo)
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "1") {
      setStatus("upgrading");
      apiRequest("/billing/upgrade", {
        method: "POST",
      })
        .then((data) => {
          setUser(data.user);
          setStatus("success");
          setMessage("Your account has been upgraded to Pro 🎉");
        })
        .catch((err) => {
          console.error(err);
          setStatus("error");
          setMessage("Could not confirm upgrade.");
        });
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    try {
      setStatus("upgrading");
      setMessage("");

      const data = await apiRequest("/billing/checkout", {
        method: "POST",
      });

      if (data.url) {
        window.location.href = data.url; // redirect to Stripe Checkout
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
        Current plan:{" "}
        <strong>{user.plan === "PRO" ? "Pro" : "Free"}</strong>
      </p>

      <p>
        Free plan: Manage up to 3 customers. <br />
        Pro plan: Unlimited customers and advanced features.
      </p>

      {user.plan !== "PRO" ? (
        <div style={{ marginTop: "16px" }}>
          <button onClick={handleUpgrade} disabled={status === "upgrading"}>
            {status === "upgrading" ? "Redirecting to Stripe…" : "Upgrade to Pro"}
          </button>
        </div>
      ) : (
        <p style={{ color: "green", marginTop: "16px" }}>
          You are on the Pro plan 🎉
        </p>
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