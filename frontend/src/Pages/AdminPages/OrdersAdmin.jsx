import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import "../../css/OrdersAdmin.css";
import { useAuthContext } from "../../contexts/AuthContext";

export default function OrdersAdmin() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !(user.email === "franiio@gmx.de" || user.isAdmin)) {
      setError("⛔ Kein Zugriff – Nur für Admins erlaubt.");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const sorted = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
        setOrders(sorted);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("📛 Firestore-Fehler:", err.message);
        setError("⚠️ Zugriff auf Bestellungen nicht möglich.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading)
    return <div className="orders-admin-loading">⏳ Lade Bestellungen...</div>;
  if (error) return <div className="orders-admin-error">{error}</div>;

  return (
    <div className="orders-admin">
      <h2>📦 Bestellungen</h2>

      {orders.length === 0 ? (
        <p>📭 Keine Bestellungen gefunden.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => {
            const date = order.timestamp?.toDate().toLocaleDateString();
            const time = order.timestamp?.toDate().toLocaleTimeString();

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <div className="order-title">📄 Bestellung</div>
                    <div className="order-id">#{order.orderId || order.id}</div>
                  </div>
                  <div className="order-date">
                    {date} – {time}
                  </div>
                </div>

                <div className="order-meta">
                  <div>
                    <span>👤</span> {order.user?.email || "Unbekannt"}
                  </div>
                  <div>
                    <span>💶</span> {order.total?.toFixed(2)} €
                  </div>
                </div>

                <div className="order-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-color-size">
                        {item.color}
                        {item.size ? ` / ${item.size}` : ""}
                      </span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
