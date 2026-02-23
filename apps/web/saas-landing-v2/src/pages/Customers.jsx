import { useEffect, useState } from "react";
import { apiRequest } from "../apiClient";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setSuccess("Customer added ✅");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setSuccess("");

    const ok = confirm("Delete this customer?");
    if (!ok) return;

    try {
      await apiRequest(`/customers/${id}`, { method: "DELETE" });
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSuccess("Customer deleted ✅");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: "24px" }}>
      <h2>Customers</h2>
      <p>Manage your customers (CRUD demo).</p>

      <div style={{ margin: "16px 0" }}>
        <form onSubmit={handleAddCustomer} className="form" style={{ display: "grid", gap: "10px", maxWidth: 520 }}>
          <input
            name="name"
            placeholder="Customer name *"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="company"
            placeholder="Company (optional)"
            value={form.company}
            onChange={handleChange}
          />

          <button type="submit">Add Customer</button>
        </form>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <hr style={{ margin: "20px 0" }} />

      {loading ? (
        <p>Loading customers…</p>
      ) : customers.length === 0 ? (
        <p>No customers yet. Add your first one above.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                <th style={{ padding: "10px" }}>Name</th>
                <th style={{ padding: "10px" }}>Email</th>
                <th style={{ padding: "10px" }}>Company</th>
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "10px" }}>{c.email || "-"}</td>
                  <td style={{ padding: "10px" }}>{c.company || "-"}</td>
                  <td style={{ padding: "10px" }}>
                    <button onClick={() => handleDelete(c.id)}>Delete</button>
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
