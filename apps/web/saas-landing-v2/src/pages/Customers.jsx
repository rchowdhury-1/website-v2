import { useEffect, useState } from "react";
import { apiRequest } from "../apiClient";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await apiRequest("/customers");
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Customer name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const newCustomer = await apiRequest("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          company: form.company.trim() || null,
        }),
      });
      setCustomers((prev) => [newCustomer, ...prev]);
      setForm({ name: "", email: "", company: "" });
      setSuccess("Customer added successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setSuccess("");
    try {
      await apiRequest(`/customers/${id}`, { method: "DELETE" });
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
      setSuccess("Customer deleted.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: "24px" }}>
      <h2>Customers</h2>
      <p style={{ color: "var(--text-muted)" }}>Manage your customers.</p>

      <form onSubmit={handleAddCustomer} className="form" style={{ maxWidth: 520, marginBottom: "24px" }}>
        <input
          name="name"
          placeholder="Customer name *"
          value={form.name}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <input
          name="company"
          placeholder="Company (optional)"
          value={form.company}
          onChange={handleChange}
          disabled={isSubmitting}
        />
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Adding…" : "Add customer"}
        </button>
      </form>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {success && <p style={{ color: "var(--success)" }}>{success}</p>}

      <hr style={{ margin: "20px 0", borderColor: "rgba(148,163,184,0.2)" }} />

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading customers…</p>
      ) : customers.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No customers yet. Add your first one above.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.company || "—"}</td>
                  <td>
                    {confirmDeleteId === c.id ? (
                      <span style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Delete?</span>
                        <button
                          className="btn btn-small"
                          style={{ background: "var(--danger)", color: "#fff", border: "none" }}
                          onClick={() => handleDelete(c.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-small btn-ghost"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        className="btn btn-small btn-ghost"
                        onClick={() => setConfirmDeleteId(c.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Customers;
