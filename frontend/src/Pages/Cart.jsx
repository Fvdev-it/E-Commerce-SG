import React, { useEffect, useState } from "react";
import "../css/Cart.css";
import { useCart } from "../contexts/FirebaseCartContext";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import logo from "../assets/...";
import Notification from "../components/Notification";

function Cart() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [country, setCountry] = useState("Deutschland");
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState("");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = country === "Deutschland" && subtotal >= 50 ? 0 : 6.9;
  const total = subtotal + shipping;

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saveCartToFirestore = async () => {
      if (!user || cart.length === 0) return;
      try {
        await setDoc(doc(db, "carts", user.uid), {
          updatedAt: serverTimestamp(),
          user: {
            uid: user.uid,
            email: user.email,
          },
          items: cart,
        });
        console.log(`✅ Cart gespeichert für: ${user.uid}`);
      } catch (err) {
        console.error("❌ Fehler beim Cart-Speichern:", err);
      }
    };
    saveCartToFirestore();
  }, [cart, user]);

  return (
    <>
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification("")}
        />
      )}

      <div className="checkout-header">
        <div className="checkout-header-left">
          <img src={logo} alt="Shop Logo" className="checkout-logo" />
        </div>
        <div className="checkout-header-center">
          <p>
            Kostenloser Versand ab 50 € – Hotline:{" "}
            <span className="hotline">0800 123 456</span>
          </p>
        </div>
        <button className="checkout-cart-btn" onClick={() => navigate("/")}>
          🏠 Zur Startseite
        </button>
      </div>

      <div className="cart-container">
        <h2>🛒 Warenkorb</h2>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>🛒 Dein Warenkorb ist leer.</p>
            <button
              className="checkout-btn"
              onClick={() => navigate("/")}
              style={{ marginTop: "10px" }}
            >
              Weiter shoppen
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-box">
              {cart.map((item, index) => (
                <div
                  className="cart-item"
                  key={`${item.id}-${item.color}-${
                    item.size || "nosize"
                  }-${index}`}
                >
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <div>
                      <p>{item.name}</p>
                      <p>
                        Farbe:
                        <span
                          className="color-circle"
                          style={{ backgroundColor: item.color }}
                        ></span>
                      </p>
                      {item.size && (
                        <p>
                          Größe: <strong>{item.size}</strong>
                        </p>
                      )}
                    </div>

                    <div>
                      <p>Menge:</p>
                      <div className="qty-control">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.color,
                              item.size
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={async () => {
                            try {
                              const ref = doc(db, "products", item.id);
                              const snap = await getDoc(ref);

                              if (!snap.exists()) {
                                showNotification(
                                  "❌ Produkt nicht mehr verfügbar"
                                );
                                return;
                              }

                              const data = snap.data();
                              const stock = data.stock || {};

                              let available = 0;
                              if (item.size) {
                                available =
                                  stock?.[item.color]?.[item.size] ?? 0;
                              } else {
                                available = stock?.[item.color] ?? 0;
                              }

                              if (item.quantity >= available) {
                                showNotification(
                                  `❌ Nur noch ${available} Stück dieser Variante verfügbar – bereits im Warenkorb.`
                                );
                                return;
                              }

                              updateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.color,
                                item.size
                              );
                            } catch (err) {
                              console.error(
                                "❌ Fehler beim Bestands-Check:",
                                err
                              );
                              showNotification(
                                "Fehler beim Überprüfen des Lagerbestands"
                              );
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <p>Stückpreis: {item.price.toFixed(2)} €</p>
                      <p>Summe: {(item.price * item.quantity).toFixed(2)} €</p>
                    </div>

                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.color, item.size)
                      }
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary-box">
              <h3>Zusammenfassung</h3>
              <label>
                Lieferland:
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="Deutschland">Deutschland</option>
                  <option value="Österreich">Österreich</option>
                  <option value="Schweiz">Schweiz</option>
                </select>
              </label>

              <p>
                Zwischensumme: <strong>{subtotal.toFixed(2)} €</strong>
              </p>
              <p>
                Versandkosten: <strong>{shipping.toFixed(2)} €</strong>
              </p>
              <p>
                Gesamtsumme: <strong>{total.toFixed(2)} €</strong>
              </p>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Weiter zur Kasse
              </button>
              <button
                className="checkout-btn"
                onClick={() => navigate("/")}
                style={{ marginTop: "10px" }}
              >
                Weiter shoppen
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;
