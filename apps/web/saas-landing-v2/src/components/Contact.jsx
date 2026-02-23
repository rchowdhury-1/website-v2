import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("http://localhost:4000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
  <section
    id="contact"
    className="section"
    style={{ border: "3px solid red", padding: "16px", marginTop: "24px" }}
  >
      <h2>Contact</h2>
      <p>Send us a message and we’ll get back to you.</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <textarea
          name="message"
          placeholder="Your message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send Message"}
        </button>
      </form>

      {status === "success" && <p>✅ Message sent!</p>}
      {status === "error" && <p>❌ Something went wrong.</p>}
    </section>
  );
}

export default Contact;

