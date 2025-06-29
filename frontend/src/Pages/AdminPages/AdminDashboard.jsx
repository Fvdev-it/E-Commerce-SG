import React, { useEffect, useState } from "react";
import "../../css/AdminDashboard.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    carts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const productsSnap = await getDocs(collection(db, "products"));
      const ordersSnap = await getDocs(collection(db, "orders"));
      const usersSnap = await getDocs(collection(db, "users"));
      const cartsSnap = await getDocs(collection(db, "carts"));

      setStats({
        products: productsSnap.size,
        orders: ordersSnap.size,
        users: usersSnap.size,
        carts: cartsSnap.size,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>👋 Willkommen im Admin Dashboard</h1>
      <p>Hier siehst du eine Übersicht deiner Shop-Daten.</p>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>📦 Produkte</h3>
          <p>{stats.products}</p>
        </div>
        <div className="dashboard-card">
          <h3>📬 Bestellungen</h3>
          <p>{stats.orders}</p>
        </div>
        <div className="dashboard-card">
          <h3>👥 Nutzer</h3>
          <p>{stats.users}</p>
        </div>
        <div className="dashboard-card">
          <h3>🛒 Warenkörbe</h3>
          <p>{stats.carts}</p>
        </div>
      </div>
    </div>
  );
}
