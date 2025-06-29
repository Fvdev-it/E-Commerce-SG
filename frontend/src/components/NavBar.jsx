import React, { useEffect, useRef, useState } from "react";
import "../css/NavBar.css";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";
import { useCart } from "../contexts/FirebaseCartContext";
import logo from "../assets/...";

function NavBar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const accountRef = useRef();
  const adminRef = useRef();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const tokenResult = await getIdTokenResult(currentUser);
        setUser({ ...currentUser, isAdmin: tokenResult.claims.admin === true });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target) &&
        adminRef.current &&
        !adminRef.current.contains(e.target)
      ) {
        setAccountOpen(false);
        setAdminOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>

        <div
          className={`burger ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`menu-items ${menuOpen ? "show" : ""}`}>
          <li>
            <a href="#home" onClick={closeMenu}>
              Home
            </a>
          </li>
          <li>
            <a href="#sellers" onClick={closeMenu}>
              Shop
            </a>
          </li>
          <li>
            <a href="#news" onClick={closeMenu}>
              Blog
            </a>
          </li>
          <li>
            <a href="#contact" onClick={closeMenu}>
              Contact
            </a>
          </li>

          <li className="navbar-auth mobile-only">
            {user ? (
              <>
                <span>👋 {user.displayName || "Benutzer"}</span>
                <Link to="/profile" onClick={closeMenu}>
                  👤 Mein Profil
                </Link>
                <Link to="/cart" onClick={closeMenu}>
                  🛒
                  {totalItems > 0 && (
                    <span className="cart-count">{totalItems}</span>
                  )}
                </Link>
                {user.isAdmin && (
                  <>
                    <Link to="/admin" onClick={closeMenu}>
                      🛠 Admin Dashboard
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  Registrieren
                </Link>
              </>
            )}
          </li>
        </ul>

        <div className="navbar-auth desktop-only">
          {user ? (
            <>
              <span>👋 {user.displayName || "Benutzer"}</span>

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

              {user.isAdmin && (
                <div className="account-menu" ref={adminRef}>
                  <button
                    className="account-trigger"
                    onClick={() => setAdminOpen((prev) => !prev)}
                  >
                    🛠 Admin ▾
                  </button>
                  {adminOpen && (
                    <div className="account-dropdown">
                      <p className="dropdown-title">Adminbereich</p>
                      <Link to="/admin">Dashboard</Link>
                    </div>
                  )}
                </div>
              )}

              <Link to="/cart" className="cart-icon">
                🛒
                {totalItems > 0 && (
                  <span className="cart-count">{totalItems}</span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Registrieren</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
