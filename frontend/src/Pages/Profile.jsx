import React, { useEffect, useRef, useState } from "react";
import "../css/Profile.css";
import logo from "../assets/...";
import { useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [standard, setStandard] = useState({ shipping: null, billing: null });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    zip: "",
    country: "Deutschland",
  });
  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    loadAddresses();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout-Fehler:", error);
    }
  };

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "users", user.uid, "addresses");
      const snap = await getDocs(ref);
      const list = [];
      let shippingId = null;
      let billingId = null;

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({ id: docSnap.id, ...data });
        if (data.isDefaultShipping) shippingId = docSnap.id;
        if (data.isDefaultBilling) billingId = docSnap.id;
      });

      setAddresses(list);
      setStandard({ shipping: shippingId, billing: billingId });
    } catch (error) {
      console.error("❌ Fehler beim Laden:", error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!user) return;

    const data = { ...form };

    try {
      if (isEditing) {
        const ref = doc(db, "users", user.uid, "addresses", isEditing);
        await updateDoc(ref, data);
      } else {
        const ref = collection(db, "users", user.uid, "addresses");
        await addDoc(ref, data);
      }

      setForm({
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        zip: "",
        country: "Deutschland",
      });
      setIsEditing(null);
      loadAddresses();
    } catch (error) {
      console.error("❌ Fehler beim Speichern:", error);
    }
  };

  const setDefault = async (id, type) => {
    const updates = addresses.map(async (addr) => {
      const ref = doc(db, "users", user.uid, "addresses", addr.id);
      await updateDoc(ref, {
        isDefaultShipping:
          type === "shipping"
            ? addr.id === id
            : addr.isDefaultShipping || false,
        isDefaultBilling:
          type === "billing" ? addr.id === id : addr.isDefaultBilling || false,
      });
    });
    await Promise.all(updates);
    loadAddresses();
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", id));
      loadAddresses();
    } catch (e) {
      console.error("❌ Fehler beim Löschen:", e);
    }
  };

  const editAddress = (addr) => {
    setForm({
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      street: addr.street,
      city: addr.city,
      zip: addr.zip,
      country: addr.country,
    });
    setIsEditing(addr.id);
  };

  if (!user || loading) return <p>⏳ Lade...</p>;

  return (
    <>
      {/*  HEADER */}
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
          {/*  Konto Dropdown */}
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

          {/* Zurück zum Shop */}
          <button className="checkout-cart-btn" onClick={() => navigate("/")}>
            🏠 Zur Startseite
          </button>
        </div>
      </div>

      {/*  Inhalt */}
      <div className="profile-container">
        <h2>📍 Adressen</h2>
        <p>
          Füge Liefer- oder Rechnungsadressen hinzu oder bearbeite bestehende.
        </p>

        <div className="profile-grid">
          {/*  Formular */}
          <div className="profile-left">
            <h3>
              {isEditing ? "Adresse bearbeiten" : "Neue Adresse hinzufügen"}
            </h3>
            <form onSubmit={saveAddress} className="address-form">
              <label>Vorname:</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />

              <label>Nachname:</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />

              <label>Straße:</label>
              <input
                name="street"
                value={form.street}
                onChange={handleChange}
                required
              />
              <label>Stadt:</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              />
              <label>PLZ:</label>
              <input
                name="zip"
                value={form.zip}
                onChange={handleChange}
                required
              />
              <label>Land:</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
              >
                <option>Deutschland</option>
                <option>Österreich</option>
                <option>Schweiz</option>
              </select>

              <button type="submit">
                {isEditing ? "Ändern" : "Hinzufügen"}
              </button>
              {isEditing && (
                <button type="button" onClick={() => setIsEditing(null)}>
                  Abbrechen
                </button>
              )}
            </form>
          </div>

          {/*  Rechte Seite */}
          <div className="profile-right">
            <div className="standard-addresses">
              <div>
                <h4>Standard-Rechnungsadresse</h4>
                {addresses.find((a) => a.id === standard.billing) ? (
                  <AddressBlock
                    data={addresses.find((a) => a.id === standard.billing)}
                  />
                ) : (
                  <p>Keine Rechnungsadresse festgelegt</p>
                )}
              </div>
              <div>
                <h4>Standard-Lieferadresse</h4>
                {addresses.find((a) => a.id === standard.shipping) ? (
                  <AddressBlock
                    data={addresses.find((a) => a.id === standard.shipping)}
                  />
                ) : (
                  <p>Keine Lieferadresse festgelegt</p>
                )}
              </div>
            </div>

            <hr />

            <h3>Alle Adressen</h3>
            {addresses.map((addr) => (
              <div key={addr.id} className="address-card">
                <AddressBlock data={addr} />
                <div className="address-actions">
                  {standard.billing !== addr.id && (
                    <button onClick={() => setDefault(addr.id, "billing")}>
                      Als Rechnungsadresse verwenden
                    </button>
                  )}
                  {standard.shipping !== addr.id && (
                    <button onClick={() => setDefault(addr.id, "shipping")}>
                      Als Lieferadresse verwenden
                    </button>
                  )}
                  <button onClick={() => editAddress(addr)}>Bearbeiten</button>
                  <button onClick={() => deleteAddress(addr.id)}>
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function AddressBlock({ data }) {
  return (
    <div className="address-block">
      <p>
        <strong>Name:</strong> {data.firstName} {data.lastName}
      </p>
      <p>
        <strong>Straße:</strong> {data.street}
      </p>
      <p>
        <strong>PLZ / Ort:</strong> {data.zip} {data.city}
      </p>
      <p>
        <strong>Land:</strong> {data.country}
      </p>
    </div>
  );
}
