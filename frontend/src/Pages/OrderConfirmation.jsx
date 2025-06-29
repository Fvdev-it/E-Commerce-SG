import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/OrderConfirmation.css";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.items || !state.user || !state.shipping) {
    return <p>Keine Bestellinformationen verfügbar.</p>;
  }

  const { orderId, items, user, total, shipping, billing, paymentMethod } =
    state;

  return (
    <div className="order-confirmation-container">
      <h2>🎉 Vielen Dank für deine Bestellung!</h2>

      <p>
        <strong>Bestellnummer:</strong> {orderId}
      </p>
      <p>
        <strong>Account:</strong> {user.displayName || "–"} ({user.email || "–"}
        )
      </p>

      <p>
        <strong>Lieferadresse:</strong>
        <br />
        {shipping.firstName} {shipping.lastName}
        <br />
        {shipping.address}
        <br />
        {shipping.zip} {shipping.city}
        <br />
        {shipping.country}
      </p>

      {billing && (
        <p>
          <strong>Rechnungsadresse:</strong>
          <br />
          {billing.firstName} {billing.lastName}
          <br />
          {billing.address}
          <br />
          {billing.zip} {billing.city}
          <br />
          {billing.country || ""}
        </p>
      )}

      {paymentMethod && (
        <p>
          <strong>Zahlungsart:</strong>{" "}
          {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
        </p>
      )}

      <div className="order-summary">
        <h3>🛍️ Deine Bestellung:</h3>
        {items.map((item, idx) => (
          <div key={idx} className="order-item">
            <img src={item.image} alt={item.name} />
            <div className="order-details">
              <p>
                <strong>{item.name}</strong>
              </p>
              {item.size && <p>Größe: {item.size}</p>}
              <p>
                Farbe:{" "}
                <span
                  className="color-dot"
                  style={{
                    backgroundColor: item.color || "#000",
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                    marginLeft: 4,
                  }}
                />
              </p>
              <p>Menge: {item.quantity}</p>
              <p>Preis: {(item.price * item.quantity).toFixed(2)} €</p>
            </div>
          </div>
        ))}

        <p className="order-confirmation-total">
          <strong>Gesamtsumme:</strong> {total?.toFixed(2) || "0.00"} €
        </p>
      </div>

      <button className="order-confirmation-btn" onClick={() => navigate("/")}>
        Weiter shoppen
      </button>
    </div>
  );
}
