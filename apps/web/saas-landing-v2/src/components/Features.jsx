function Features({ items }) {
  return (
    <section id="features" className="section">
      <h2>Features</h2>

      <ul className="features-grid">
        {items.map((feature, index) => (
          <li key={index} className="feature-item">
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Features;

