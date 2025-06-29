import React from "react";
import "../css/Contact.css";

function Contact() {
  return (
    <section id="contact" className="contact">
      <div className="contact-box container">
        <div className="contact-map">
          <iframe
            title="Standortkarte"
            src="https://www.google.com/maps/embed?pb="
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div className="form-txt">
          <div className="contact-info-label">KONTAKT</div>
          <h1 className="contact-title">Schreib uns</h1>
          <p className="contact-description">
            Du hast Fragen oder Feedback? Dann schreib uns einfach über das
            Kontaktformular – wir melden uns schnellstmöglich zurück.
          </p>
          <p>
            Fülle dazu bitte deine Kontaktdaten und dein Anliegen unten aus.
          </p>
        </div>

        <div className="form-details">
          <form>
            <input type="text" placeholder="Dein Name" required />
            <input type="email" placeholder="Deine E-Mail-Adresse" required />
            <textarea
              rows="4"
              placeholder="Deine Nachricht..."
              required
            ></textarea>
            <button type="submit">NACHRICHT ABSENDEN</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
