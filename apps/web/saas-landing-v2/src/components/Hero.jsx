function Hero({ title, subtitle, primaryCta, secondaryCta }) {
  return (
    <section id="hero" className="hero">
      <div className="hero-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>

        <div className="hero-actions">
          <button className="primary-btn">{primaryCta}</button>
          <button className="secondary-btn">{secondaryCta}</button>
        </div>
      </div>
    </section>
  );
}

export default Hero;


