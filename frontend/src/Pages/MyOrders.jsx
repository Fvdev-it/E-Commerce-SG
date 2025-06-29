import React, { useEffect, useState, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import "../css/MyOrders.css";
import logo from "../assets/...";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, "orders"),
          where("user.uid", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((order) => order.timestamp?.seconds)
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("❌ Fehler beim Laden der Bestellungen:", error);
      }
    };

    if (currentUser) fetchOrders();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <p className="my-orders-msg">⏳ Lade deine Bestellungen...</p>;
  }

  if (!currentUser) {
    return (
      <p className="my-orders-msg">
        🔐 Bitte melde dich an, um deine Bestellungen zu sehen.
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <p className="my-orders-msg">
        🕳️ Du hast bisher keine Bestellungen aufgegeben.
      </p>
    );
  }

  return (
    <>
      {/* ✅ HEADER */}
      <div className="checkout-header">
        <div className="checkout-header-left">
          <img src={logo} alt="Shop Logo" className="checkout-logo" />
        </div>
        <div className="checkout-header-center">
          <p>
            Kostenloser Versand in Deutschland ab 50 € – Hotline:{" "}
            <span className="hotline">0800 123 456</span>
          </p>
        </div>
        <div className="checkout-header-right">
          <div className="account-menu" ref={accountRef}>
            <button
              className="account-trigger"
              onClick={() => setAccountOpen((prev) => !prev)}
            >
              👤 Mein Konto ▾
            </button>
            {accountOpen && (
              <div className="account-dropdown">
                <p className="dropdown-title">Mein Konto</p>
                <Link to="/profile">Kundenprofil</Link>
                <Link to="/meine-bestellungen">Bestellungen</Link>
                <button onClick={handleLogout} className="logout-button">
                  🚪 Abmelden
                </button>
              </div>
            )}
          </div>
          <button className="checkout-cart-btn" onClick={() => navigate("/")}>
            🏠 Zur Startseite
          </button>
        </div>
      </div>

      {/* ✅ BREITE FREIGEBEN */}
      <div className="orders-page-wrapper">
        <div className="my-orders-container">
          <h2>🧾 Meine Bestellungen</h2>
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-box">
                <h3>Bestellung #{order.orderId}</h3>
                <p>
                  <strong>Bestellt am:</strong>{" "}
                  {new Date(order.timestamp?.seconds * 1000).toLocaleString()}
                </p>
                <p>
                  <strong>Gesamtsumme:</strong>{" "}
                  {order.total?.toFixed(2) || "0.00"} €
                </p>
                <p>
                  <strong>Lieferadresse:</strong>
                  <br />
                  {order.shipping?.firstName} {order.shipping?.lastName}
                  <br />
                  {order.shipping?.address}
                  <br />
                  {order.shipping?.zip} {order.shipping?.city}
                  <br />
                  {order.shipping?.country}
                </p>
                <p>
                  <strong>Zahlungsart:</strong>{" "}
                  {{
                    klarna: "Klarna",
                    paypal: "PayPal",
                    kreditkarte: "Kreditkarte",
                    vorkasse: "Vorkasse",
                    nachname: "Nachname",
                  }[order.paymentMethod] || order.paymentMethod}
                </p>

                <div className="order-items">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <p>
                          <strong>{item.name}</strong>
                        </p>
                        {item.color && <p>Farbe: {item.color}</p>}
                        {item.size && <p>Größe: {item.size}</p>}
                        <p>Menge: {item.quantity}</p>
                        <p>
                          Preis: {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="order-back-btn" onClick={() => navigate("/")}>
            ⬅️ Zurück zum Shop
          </button>
        </div>
      </div>
    </>
  );
}
