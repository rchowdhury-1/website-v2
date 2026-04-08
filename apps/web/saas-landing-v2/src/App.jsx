import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import api from "./apiClient";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Billing from "./pages/Billing";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // continue regardless
    }
    localStorage.removeItem("token");
    closeMenu();
    window.location.href = "/";
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-mark">▢</span>
            <span className="logo-text">Rizwan Web Studio</span>
          </Link>

          {/* Desktop nav */}
          <nav className="main-nav">
            <a href="/#services">Services</a>
            <a href="/#pricing">Pricing</a>
          </nav>

          <div className="auth-nav">
            {!token ? (
              <>
                <Link to="/login" className="link-muted">Log in</Link>
                <Link to="/register" className="btn btn-small btn-primary">Get started</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/customers">Customers</Link>
                <Link to="/billing">Billing</Link>
                <button className="btn btn-small btn-ghost" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className="hamburger"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <nav className="mobile-nav" onClick={closeMenu}>
            <a href="/#services">Services</a>
            <a href="/#pricing">Pricing</a>
            {!token ? (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/register" className="btn btn-primary" style={{ marginTop: "8px" }}>Get started</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/customers">Customers</Link>
                <Link to="/billing">Billing</Link>
                <button className="btn btn-ghost" onClick={handleLogout} style={{ marginTop: "8px" }}>Logout</button>
              </>
            )}
          </nav>
        )}
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
