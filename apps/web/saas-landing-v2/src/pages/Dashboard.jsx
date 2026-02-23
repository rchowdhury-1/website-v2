import { useEffect, useState } from "react";
import { apiRequest } from "../apiClient";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiRequest("/auth/me")
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p>Welcome {user.name || user.email}</p>
    </div>
  );
}

export default Dashboard;
