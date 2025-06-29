import React from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import "../../css/AdminLayout.css";

export default function AdminLayout() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" />;
  const isAdmin = user.email === "franiio@gmx.de" || user.isAdmin;
  if (!isAdmin) return <p>⛔ Kein Zugriff</p>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <h2>🛠 Admin Panel</h2>
          <nav className="admin-nav">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📊 Dashboard
            </NavLink>
            <NavLink
              to="/admin/produkte"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📦 Produkte
            </NavLink>
            <NavLink
              to="/admin/bestellungen"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📬 Bestellungen
            </NavLink>
            <NavLink
              to="/admin/import"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              📥 Importieren
            </NavLink>
          </nav>
        </div>

        <button className="back-to-shop-btn" onClick={() => navigate("/")}>
          🏠 Zurück zum Shop
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
