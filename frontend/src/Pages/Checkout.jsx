import { useState, useEffect } from "react";
import "../css/Checkout.css";
import { useCart } from "../contexts/FirebaseCartContext";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import logo from "../assets/...";
import klarnaicon from "../assets/...";
import paypalicon from "../assets/...";
import kreditkarteicon from "../assets/...";
import emailjs from "emailjs-com";
emailjs.init("DEIN PUBLIC KEY");

// PayPal
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// Stripe
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const paymentOptions = [
    {
      value: "klarna",
      label: "Klarna",
      description: "Kauf auf Rechnung, Lastschrift oder Sofortüberweisung",
      icon: klarnaicon,
    },
    {
      value: "paypal",
      label: "PayPal",
      description: "Sicher bezahlen mit PayPal",
      icon: paypalicon,
    },
    {
      value: "kreditkarte",
      label: "Kreditkarte",
      description: "Visa, Mastercard, American Express",
      icon: kreditkarteicon,
    },
    {
      value: "nachname",
      label: "Nachname",
      description: "Barzahlung bei Lieferung (zzgl. 5,90 € Gebühr)",
      icon: null,
    },
  ];

  const [clientSecret, setClientSecret] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zip: "",
    country: "Deutschland",
    invoiceDifferent: false,
    invoiceFirstName: "",
    invoiceLastName: "",
    invoiceAddress: "",
    invoiceCity: "",
    invoiceZip: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("klarna");
  const isNachname = paymentMethod === "nachname";
  const nachnameFee = isNachname ? 5.9 : 0;

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = form.country === "Deutschland" && subtotal >= 50 ? 0 : 6.9;
  const total = subtotal + shipping + nachnameFee;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDocs(
        collection(db, "users", user.uid, "addresses")
      );
      const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAddresses(loaded);
      const def = loaded.find((a) => a.isDefaultShipping);
      if (def) {
        setForm((p) => ({
          ...p,
          firstName: def.firstName || "",
          lastName: def.lastName || "",
          address: def.street || "",
          city: def.city || "",
          zip: def.zip || "",
          country: def.country || "Deutschland",
        }));
      }
    })();
  }, [user]);

  useEffect(() => {
    const fetchClientSecret = async () => {
      if (paymentMethod !== "kreditkarte" || !total) return;

      try {
        const res = await fetch(
          import.meta.env.VITE_CREATE_PAYMENT_INTENT_URL ||
            "/create-payment-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: Math.round(total * 100) }),
          }
        );
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("❌ Fehler beim Laden des clientSecret:", err);
      }
    };

    fetchClientSecret();
  }, [paymentMethod, total]);

  async function fetchCityByZip(zip) {
    try {
      const res = await fetch(`https://api.zippopotam.us/de/${zip}`);
      if (!res.ok) throw new Error("PLZ nicht gefunden");
      const data = await res.json();
      return data.places[0]["place name"];
    } catch (error) {
      console.error("Fehler bei PLZ-Abfrage:", error);
      return "";
    }
  }

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "zip") {
      if (!/^\d*$/.test(value)) return;

      setForm((p) => ({ ...p, zip: value }));

      if (value.length === 5) {
        const city = await fetchCityByZip(value);
        if (city) {
          setForm((p) => ({ ...p, city }));
        }
      } else {
        setForm((p) => ({ ...p, city: "" }));
      }
    } else {
      setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleAddressSelect = (id) => {
    const sel = addresses.find((a) => a.id === id);
    if (sel) {
      setForm((p) => ({
        ...p,
        firstName: sel.firstName || "",
        lastName: sel.lastName || "",
        address: sel.street || "",
        zip: sel.zip || "",
        city: sel.city || "",
        country: sel.country || "Deutschland",
      }));
    }
  };

  const handleInvoiceSelect = (id) => {
    const sel = addresses.find((a) => a.id === id);
    if (sel) {
      setForm((p) => ({
        ...p,
        invoiceFirstName: sel.firstName || "",
        invoiceLastName: sel.lastName || "",
        invoiceAddress: sel.street || "",
        invoiceZip: sel.zip || "",
        invoiceCity: sel.city || "",
      }));
    }
  };

  const placeOrder = async (paymentDetails = {}) => {
    if (!user) return alert("Bitte anmelden!");
    try {
      for (const item of cart) {
        const snap = await getDoc(doc(db, "products", item.id));
        if (!snap.exists()) throw new Error(`Produkt ${item.name} fehlt`);
        const stockMap = snap.data().stock || {};
        const stockEntry = stockMap[item.color];
        if (!stockEntry) throw new Error(`Keine Lagerinfo für ${item.name}`);
        const qty = item.size ? stockEntry[item.size] ?? 0 : stockEntry ?? 0;
        if (item.quantity > qty)
          throw new Error(`Nur ${qty} verfügbar von ${item.name}`);
      }

      for (const item of cart) {
        const ref = doc(db, "products", item.id);
        const snap = await getDoc(ref);
        const stockMap = snap.data().stock || {};
        const colorStock = stockMap[item.color];
        let updated;
        if (item.size) {
          const oldQty = colorStock[item.size] ?? 0;
          const newQty = Math.max(oldQty - item.quantity, 0);
          updated = {
            ...stockMap,
            [item.color]: { ...colorStock, [item.size]: newQty },
          };
        } else {
          updated = {
            ...stockMap,
            [item.color]: Math.max((colorStock ?? 0) - item.quantity, 0),
          };
        }
        const soldOut = Object.values(updated).every((e) =>
          typeof e === "object" ? Object.values(e).every((q) => q <= 0) : e <= 0
        );
        await updateDoc(ref, {
          stock: updated,
          status: soldOut ? "ausverkauft" : "verfügbar",
        });
      }

      const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
      const orderData = {
        orderId,
        timestamp: serverTimestamp(),
        user: {
          uid: user.uid,
          displayName: user.displayName || `${form.firstName} ${form.lastName}`,
          email: user.email,
        },
        shipping: {
          firstName: form.firstName,
          lastName: form.lastName,
          address: form.address,
          zip: form.zip,
          city: form.city,
          country: form.country,
        },
        billing: form.invoiceDifferent
          ? {
              firstName: form.invoiceFirstName,
              lastName: form.invoiceLastName,
              address: form.invoiceAddress,
              zip: form.invoiceZip,
              city: form.invoiceCity,
            }
          : null,
        items: cart,
        total,
        paymentMethod,
        paymentDetails,
      };

      await setDoc(
        doc(
          db,
          "orders",
          `order-${user.email.replace(/[@.]/g, "-")}-${orderId}`
        ),
        orderData
      );

      //Mail senden

      await emailjs.send("service_sugarglidermerch", "TEMPLATE ID", {
        to_name: orderData.user.displayName,
        to_email: orderData.user.email,
        order_id: orderData.orderId,
        orders: cart.map((i) => ({
          name: i.name,
          units: i.quantity,
          price: (i.price * i.quantity).toFixed(2),
          image_url: i.image,
          size: i.size || "",
          color: i.color || "",
        })),
        cost: {
          shipping: shipping.toFixed(2),
          cod: isNachname ? nachnameFee.toFixed(2) : "0.00",
          total: total.toFixed(2),
        },
        shipping_address: `${form.firstName} ${form.lastName}
${form.address}
${form.zip} ${form.city}
${form.country}`,
        payment_method: paymentMethod,
        email: user.email,
      });

      clearCart();
      navigate("/order-confirmation", { state: orderData });
    } catch (err) {
      console.error("Checkout-Fehler:", err);
      alert(`Fehler: ${err.message}`);
    }
  };

  return (
    <>
      <header className="checkout-header">
        <div className="checkout-header-left">
          <img src={logo} alt="Logo" className="checkout-logo" />
        </div>
        <div className="checkout-header-center">
          <p>
            <strong>Fragen?</strong> Hotline:{" "}
            <span className="hotline">0123 45678912</span>
          </p>
        </div>
        <div className="checkout-header-right">
          <button
            className="checkout-cart-btn"
            onClick={() => navigate("/cart")}
          >
            Zurück zum Warenkorb
          </button>
        </div>
      </header>

      <main className="checkout-container">
        <h1>Bestellung abschließen</h1>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
            {addresses.length > 0 && (
              <label>
                Adresse auswählen
                <select onChange={(e) => handleAddressSelect(e.target.value)}>
                  <option value="">– Adresse wählen –</option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.firstName} {a.lastName}, {a.street}, {a.zip} {a.city}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <fieldset>
              <legend>Lieferadresse</legend>
              <label>
                Vorname
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Nachname
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Straße
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                PLZ
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={5}
                  required
                />
              </label>
              <label>
                Stadt
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Land
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                >
                  <option>Deutschland</option>
                  <option>Österreich</option>
                  <option>Schweiz</option>
                </select>
              </label>
            </fieldset>
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="invoiceDifferent"
                checked={form.invoiceDifferent}
                onChange={handleChange}
              />
              Rechnungsadresse ist abweichend
            </label>
            {form.invoiceDifferent && (
              <>
                {addresses.length > 0 && (
                  <label>
                    Rechnungsadresse auswählen
                    <select
                      onChange={(e) => handleInvoiceSelect(e.target.value)}
                    >
                      <option value="">– wählen –</option>
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.firstName} {a.lastName}, {a.street}, {a.zip}{" "}
                          {a.city}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <fieldset>
                  <legend>Rechnungsadresse</legend>
                  <label>
                    Vorname
                    <input
                      name="invoiceFirstName"
                      value={form.invoiceFirstName}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Nachname
                    <input
                      name="invoiceLastName"
                      value={form.invoiceLastName}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Straße
                    <input
                      name="invoiceAddress"
                      value={form.invoiceAddress}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Stadt
                    <input
                      name="invoiceCity"
                      value={form.invoiceCity}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    PLZ
                    <input
                      name="invoiceZip"
                      value={form.invoiceZip}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </fieldset>
              </>
            )}
            <section className="checkout-payment">
              <h2>Zahlungsart</h2>
              <div className="payment-methods">
                {paymentOptions.map((m) => (
                  <label
                    key={m.value}
                    className={`payment-box ${
                      paymentMethod === m.value ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.value}
                      checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)}
                    />
                    <div className="payment-content">
                      <div className="payment-texts">
                        <span className="payment-title">{m.label}</span>
                        {m.description && <p>{m.description}</p>}
                      </div>
                      {m.icon && (
                        <img
                          src={m.icon}
                          alt={`${m.label} icon`}
                          className="payment-icon"
                        />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </section>
            {paymentMethod === "paypal" && (
              <PayPalScriptProvider
                options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID }}
              >
                <PayPalButtons
                  style={{ layout: "horizontal" }}
                  createOrder={(d, a) =>
                    a.order.create({
                      purchase_units: [{ amount: { value: total.toFixed(2) } }],
                    })
                  }
                  onApprove={async (d, a) => {
                    const details = await a.order.capture();
                    await placeOrder({ provider: "paypal", details });
                  }}
                  onError={(err) => alert("PayPal Fehler: " + err.message)}
                />
              </PayPalScriptProvider>
            )}
            {paymentMethod === "kreditkarte" && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeForm placeOrder={placeOrder} />
              </Elements>
            )}

            {paymentMethod === "klarna" && (
              <KlarnaForm total={total} placeOrder={placeOrder} form={form} />
            )}
            {paymentMethod === "nachname" && (
              <button
                type="button"
                className="checkout-btn"
                onClick={() => placeOrder({ provider: "nachname" })}
              >
                Zahlung bei Lieferung
              </button>
            )}
          </form>

          <aside className="checkout-summary">
            <h2>🧾 Deine Bestellung</h2>
            {cart.map((item, i) => (
              <div className="summary-item" key={i}>
                <img src={item.image} alt={item.name} />
                <div className="summary-details">
                  <p>{item.name}</p>
                  {item.size && <p>Größe: {item.size}</p>}
                  <p>
                    Farbe:
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: item.color,
                        border: "1px solid #ccc",
                        marginLeft: "4px",
                      }}
                    />
                  </p>
                  <p>Menge: {item.quantity}</p>
                  <p>Preis: {(item.price * item.quantity).toFixed(2)} €</p>
                </div>
              </div>
            ))}
            <hr />
            <p>
              Zwischensumme: <strong>{subtotal.toFixed(2)} €</strong>
            </p>
            <p>
              Versand: <strong>{shipping.toFixed(2)} €</strong>
            </p>
            {isNachname && (
              <p>
                Nachnamegebühr: <strong>{nachnameFee.toFixed(2)} €</strong>
              </p>
            )}
            <p>
              Gesamt: <strong>{total.toFixed(2)} €</strong>
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}

// Stripe-Komponente
function StripeForm({ placeOrder }) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async () => {
    if (!stripe || !elements) {
      alert("Stripe wurde nicht korrekt geladen.");
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        alert(error.message);
      } else if (paymentIntent?.status === "succeeded") {
        placeOrder({ provider: "stripe", paymentIntent });
      }
    } catch (err) {
      console.error("❌ Stripe Fehler:", err);
      alert("Ein Fehler ist bei der Bezahlung aufgetreten.");
    }
  };

  return (
    <>
      <PaymentElement />
      <button type="button" className="checkout-btn" onClick={handlePay}>
        Jetzt mit Karte bezahlen
      </button>
    </>
  );
}

// Klarna-Komponente
function KlarnaForm({ total, placeOrder, form }) {
  useEffect(() => {
    const klarnaToken = import.meta.env.VITE_KLARNA_CLIENT_TOKEN;
    console.log("Klarna Token:", import.meta.env.VITE_KLARNA_CLIENT_TOKEN);

    const script = document.createElement("script");
    script.src = "https://x.klarnacdn.net/kp/lib/v1/api.js";
    script.async = true;
    script.onload = () => {
      if (window.Klarna && klarnaToken) {
        window.Klarna.Payments.init({ client_token: klarnaToken });
        window.Klarna.Payments.load(
          { container: "#kp-container" },
          {
            purchase_country: "DE",
            purchase_currency: "EUR",
            locale: "de-DE",
          }
        );
      } else {
        console.error("❌ Klarna nicht geladen oder Token fehlt.");
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleKlarna = () => {
    if (!window.Klarna?.Payments) {
      alert("⚠️ Klarna konnte nicht geladen werden.");
      return;
    }

    window.Klarna.Payments.authorize(
      {},
      {
        billing_address: {
          given_name: form.firstName,
          family_name: form.lastName,
          street_address: form.address,
          postal_code: form.zip,
          city: form.city,
          country: form.country || "DE",
        },
        shipping_address: {
          given_name: form.firstName,
          family_name: form.lastName,
          street_address: form.address,
          postal_code: form.zip,
          city: form.city,
          country: form.country || "DE",
        },
      },
      (res) => {
        if (res.approved) {
          placeOrder({ provider: "klarna", klarna: res });
        } else {
          alert("❌ Zahlung wurde nicht autorisiert.");
        }
      }
    );
  };

  return (
    <>
      <div id="kp-container" style={{ marginBottom: "1rem" }}></div>
      <button type="button" className="checkout-btn" onClick={handleKlarna}>
        Mit Klarna bezahlen
      </button>
    </>
  );
}
