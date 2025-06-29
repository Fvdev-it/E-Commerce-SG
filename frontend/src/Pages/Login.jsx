import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Auth.css";

const Login = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const redirectPath =
    new URLSearchParams(location.search).get("redirect") || "/";
  const verifyMessage = new URLSearchParams(location.search).get("verify");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error("Login fehlgeschlagen:", err);
      if (err.code === "auth/user-not-found") {
        setError("Benutzer nicht gefunden.");
      } else if (err.code === "auth/wrong-password") {
        setError("Falsches Passwort.");
      } else {
        setError("Login fehlgeschlagen. Bitte versuche es erneut.");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {verifyMessage && (
        <div className="auth-info">
          E-Mail bestätigen: Bitte überprüfe dein Postfach.
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
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
            className="full-width"
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

        {error && <div className="auth-error">{error}</div>}

        <button type="submit">Einloggen</button>
      </form>
    </div>
  );
};

export default Login;
