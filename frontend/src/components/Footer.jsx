import React from "react";
import "../css/Footer.css";
import logo from "../assets/...";
import klarnaicon from "../assets/...";
import paypalicon from "../assets/...";
import kreditkarteicon from "../assets/...";

function Footer() {
  return (
    <footer>
      <div className="footer-container container">
        <div className="content_1">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>

        <div className="content_2">
          <h4>SHOPPING</h4>
          <a href="#sellers">Merch</a>
          <a href="#sellers">Anziehsachen</a>
          <a href="#sellers">Gebrauchsgegenstände</a>
          <a href="#sellers">Accessories</a>
        </div>

        <div className="content_3">
          <h4>SHOPPING</h4>
          <a href="#contact">Kontaktiere Uns</a>
          <a href="#contact" target="_blank" rel="noreferrer">
            Für
          </a>
          <a href="#contact">Rückgabe und Umtausch</a>
          <a href="#contact" target="_blank" rel="noreferrer">
            Zahlungsmethoden
          </a>

          <div className="payment-icons">
            <img src={klarnaicon} alt="Klarna" />
            <img src={paypalicon} alt="PayPal" />
            <img src={kreditkarteicon} alt="Kreditkarte" />
          </div>
        </div>

        <div className="content_4">
          <h4>NEWSLETTER</h4>
          <p>
            Erfahre als Erste*r von Neuheiten, <br />
            Angeboten & Aktionen!
          </p>
          <p>folgt in Kürze!</p>
          <div className="f-mail">
            <input type="email" placeholder="Your Email" />
            <i className="bx bx-envelope"></i>
          </div>
          <hr />
        </div>
      </div>

      <div className="f-design">
        <div className="f-design-txt container">
          <p>Design and Code by fvdev.it</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
