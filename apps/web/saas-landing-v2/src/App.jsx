import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Billing from "./pages/Billing";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">▢</span>
            <span className="logo-text">Rizwan Web Studio</span>
          </Link>

          <nav className="main-nav">
            <a href="/#services">Services</a>
            <a href="/#pricing">Pricing</a>
          </nav>

          <div className="auth-nav">
            {!token ? (
              <>
                <Link to="/login" className="link-muted">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-small btn-primary">
                  Get started
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/customers">Customers</Link>
                <Link to="/billing">Billing</Link>
                <button className="btn btn-small btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;