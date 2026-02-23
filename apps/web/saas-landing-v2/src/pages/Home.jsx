import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiRequest } from "../apiClient";

function Home() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Check if user is logged in & get plan
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      return;
    }

    apiRequest("/auth/me")
      .then((data) => {
        setUser(data); // { id, name, email, plan, created_at }
      })
      .catch(() => {
        // token invalid – clear it
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, []);

  const isLoggedIn = !!user;
  const isPro = user?.plan === "PRO";

  // Decide where main CTAs go
  const primaryCtaPath = !isLoggedIn ? "/register" : isPro ? "/dashboard" : "/billing";
  const primaryCtaLabel = !isLoggedIn
    ? "Get a project quote"
    : isPro
    ? "Go to dashboard"
    : "Upgrade to Pro";

  const secondaryCtaPath = !isLoggedIn ? "/login" : "/customers";
  const secondaryCtaLabel = !isLoggedIn ? "Log in" : "View customers";

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="hero-content">
          <p className="badge">Websites & CRM for growing businesses</p>
          <h1>
            Modern websites & custom CRM solutions
            <span className="accent"> built for your business</span>.
          </h1>
          <p className="hero-subtitle">
            I design and develop high-performing business websites, e-commerce
            stores, and internal tools like CRMs & dashboards —
            with clean UX, responsive design, and fast performance.
          </p>

          <div className="hero-cta">
            <Link to={primaryCtaPath} className="btn btn-primary">
              {primaryCtaLabel}
            </Link>
            <Link to={secondaryCtaPath} className="btn btn-ghost">
              {secondaryCtaLabel}
            </Link>
          </div>

          <div className="hero-meta">
            <span>✅ Responsive & mobile-first</span>
            <span>✅ SEO-friendly builds</span>
            <span>✅ Integrations: Stripe, forms, CRM</span>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-card">
            <p className="hero-card-label">Example project snapshot</p>
            <h3>Lead tracking dashboard</h3>
            <ul>
              <li>🔹 Track leads, customers, and revenue</li>
              <li>🔹 Simple CRM with notes & statuses</li>
              <li>🔹 Connected to contact forms and landing pages</li>
            </ul>
            <p className="hero-card-footer">
              Built with React, Node, and modern UI patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section" id="services">
        <h2>Services I provide</h2>
        <p className="section-subtitle">
          I help small businesses and founders ship professional, reliable web
          experiences — not just pretty landing pages.
        </p>

        <div className="grid grid-3">
          <div className="card">
            <h3>Business websites</h3>
            <p>
              Clean, modern company sites that clearly explain what you do,
              build trust, and convert visitors into leads.
            </p>
            <ul className="card-list">
              <li>• About, services, team, contact pages</li>
              <li>• Integrated contact forms & email</li>
              <li>• SEO-friendly and fast</li>
            </ul>
          </div>

          <div className="card">
            <h3>E-commerce stores</h3>
            <p>
              Full e-commerce websites with product pages, carts, and secure
              payments using Stripe or your preferred provider.
            </p>
            <ul className="card-list">
              <li>• Product catalog & filters</li>
              <li>• Checkout & payment integration</li>
              <li>• Order confirmation emails</li>
            </ul>
          </div>

          <div className="card">
            <h3>Custom CRM & dashboards</h3>
            <p>
              Internal tools tailored to your workflow — track leads, clients,
              and performance in one place.
            </p>
            <ul className="card-list">
              <li>• Lead & customer management</li>
              <li>• Simple analytics & reporting</li>
              <li>• Login, roles & permissions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section section-muted">
        <h2>How projects work</h2>
        <div className="grid grid-3 process-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Quick call & scope</h3>
            <p>
              We discuss your goals, pages, features, and integrations
              (booking, payments, CRM, etc.) and define a clear scope.
            </p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Design & build</h3>
            <p>
              I design a simple, modern UI and build it with clean, maintainable
              code — mobile-first and optimized for performance.
            </p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Launch & support</h3>
            <p>
              I deploy your site (or app), connect your domain, and provide
              support after launch. Need changes later? I can help.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section" id="pricing">
        <h2>Transparent, competitive pricing</h2>
        <p className="section-subtitle">
          Simple packages for common projects. Custom quotes available for more complex needs
          like multi-language sites, advanced dashboards, or integrations.
        </p>

        <div className="grid grid-3">
          <div className="card card-pricing">
            <p className="plan-name">Starter site</p>
            <p className="plan-price">£450</p>
            <p className="plan-description">
              Ideal for freelancers and small businesses who need a clean,
              professional online presence.
            </p>
            <ul className="card-list">
              <li>• Up to 4 pages (Home, About, Services, Contact)</li>
              <li>• Mobile-friendly responsive design</li>
              <li>• Basic contact form & email routing</li>
              <li>• SEO-friendly structure</li>
            </ul>

            {/* If logged in and not PRO, send them to Billing (Stripe). Otherwise, to Register/Login */}
            {isLoggedIn ? (
              <Link to={isPro ? "/dashboard" : "/billing"} className="btn btn-outline">
                {isPro ? "View dashboard" : "Start with Starter site"}
              </Link>
            ) : (
              <Link to="/register" className="btn btn-outline">
                Request this package
              </Link>
            )}
          </div>

          <div className="card card-pricing card-pricing-featured">
            <p className="plan-tag">Most popular</p>
            <p className="plan-name">Business + CRM</p>
            <p className="plan-price">£850</p>
            <p className="plan-description">
              For service businesses that want a website plus a simple internal
              system to track leads and clients.
            </p>
            <ul className="card-list">
              <li>• Everything in Starter site</li>
              <li>• Simple CRM to track leads and customers</li>
              <li>• Admin login with protected dashboard</li>
              <li>• Basic analytics (leads, customers, revenue)</li>
            </ul>

            {isLoggedIn ? (
              <Link to={isPro ? "/dashboard" : "/billing"} className="btn btn-primary btn-full">
                {isPro ? "You’re on Pro – go to dashboard" : "Upgrade to Business + CRM (Pro)"}
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-full">
                Book this package
              </Link>
            )}
          </div>

          <div className="card card-pricing">
            <p className="plan-name">E-commerce store</p>
            <p className="plan-price">from £1,200</p>
            <p className="plan-description">
              For shops that need to sell products online with a smooth
              checkout and payment experience.
            </p>
            <ul className="card-list">
              <li>• Product pages and categories</li>
              <li>• Stripe or other payment integration</li>
              <li>• Cart & checkout flow</li>
              <li>• Order confirmation emails</li>
            </ul>

            {isLoggedIn ? (
              <Link to="/billing" className="btn btn-outline">
                Discuss your store & upgrade
              </Link>
            ) : (
              <Link to="/register" className="btn btn-outline">
                Discuss your store
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section section-muted" id="contact">
        <h2>Ready to talk about your project?</h2>
        <p className="section-subtitle">
          Send a quick message with the type of website or system you want
          (business site, CRM, e-commerce, etc.) and I’ll reply with next steps.
        </p>

        <div className="contact-cta">
          {!isLoggedIn ? (
            <>
              <Link to="/register" className="btn btn-primary">
                Create an account
              </Link>
              <Link to="/login" className="btn btn-ghost">
                Log in to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="btn btn-primary">
                Go to dashboard
              </Link>
              {!isPro && (
                <Link to="/billing" className="btn btn-ghost">
                  Upgrade to Pro
                </Link>
              )}
            </>
          )}
        </div>

        <p className="hint">
          Prefer email? You can later wire this section to a contact form that posts
          to your backend or a tool like Formspree / Resend.
        </p>
      </section>
    </div>
  );
}

export default Home;
