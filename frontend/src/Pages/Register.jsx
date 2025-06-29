import React, { useState } from "react";
import "../css/Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

function Register() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const passwordValidations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_\-+=<>?{}[\]~]/.test(password),
  };

  const allValid = Object.values(passwordValidations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!allValid) {
      setError("Bitte erfülle alle Passwortanforderungen.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: nickname,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Diese E-Mail ist bereits registriert.");
      } else if (err.code === "auth/invalid-email") {
        setError("Ungültige E-Mail-Adresse.");
      } else {
        setError("Registrierung fehlgeschlagen.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Registrieren</h2>

      {success && (
        <div className="auth-info">
          ✅ Registrierung erfolgreich! Du wirst weitergeleitet ...
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Passwort anzeigen
          </label>
        </div>

        <div className="password-feedback">
          <p className={passwordValidations.length ? "valid" : "invalid"}>
            • Mindestens 8 Zeichen
          </p>
          <p className={passwordValidations.uppercase ? "valid" : "invalid"}>
            • Mindestens 1 Großbuchstabe
          </p>
          <p className={passwordValidations.number ? "valid" : "invalid"}>
            • Mindestens 1 Zahl
          </p>
          <p className={passwordValidations.special ? "valid" : "invalid"}>
            • Mindestens 1 Sonderzeichen
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={!allValid}>
          Registrieren
        </button>

        <p>
          Schon ein Konto? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
