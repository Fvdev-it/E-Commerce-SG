# 🎉 Sugar Glider Merch – E-Commerce Plattform

---

## 1. Projektübersicht

**Projektname:** Sugar Glider Merch  
**Typ:** Fullstack E-Commerce Webanwendung  
**Technologien:**

<div style="display:flex;gap:1rem;flex-wrap:wrap;">
  <span style="background:#61dafb;color:#000;padding:0.2em 0.6em;border-radius:4px;">React (Vite)</span>
  <span style="background:#ffca28;color:#000;padding:0.2em 0.6em;border-radius:4px;">Firebase (Firestore, Auth)</span>
  <span style="background:#6772e5;color:#fff;padding:0.2em 0.6em;border-radius:4px;">Stripe</span>
  <span style="background:#003087;color:#fff;padding:0.2em 0.6em;border-radius:4px;">PayPal</span>
  <span style="background:#00a3e0;color:#fff;padding:0.2em 0.6em;border-radius:4px;">Klarna</span>
  <span style="background:#d93025;color:#fff;padding:0.2em 0.6em;border-radius:4px;">EmailJS</span>
  <span style="background:#007acc;color:#fff;padding:0.2em 0.6em;border-radius:4px;">CSS</span>
</div>

Beschreibung:  
Diese Plattform bildet einen komplett funktionsfähigen Online-Shop ab – vom Produktimport, über Warenkorb und Checkout bis hin zur Zahlungsabwicklung und Admin-Verwaltung. Ideal als professionelles Portfolio-Projekt oder technische Basis.

---

## 2. Funktionen & Features

### 🛍️ Kundenseite

- **Produktkatalog:**

  - Übersichtliche Anzeige aller Produkte mit Bildern, Farben, Größen und Preisen
  - Produktfilterung nach Kategorien, Farben und Verfügbarkeit
  - Detailansicht mit Produktbeschreibung, Verfügbarkeit und Variantenwahl (Größe, Farbe)

- **Warenkorb:**

  - Hinzufügen, Ändern und Entfernen von Produkten mit Varianten (Farbe, Größe)
  - Echtzeit-Update und Synchronisation bei eingeloggten Nutzern
  - Zwischensumme, Versandkostenberechnung und Gesamtpreis

- **Checkout & Bestellprozess:**

  - Eingabe von Liefer- und optional abweichender Rechnungsadresse
  - Automatische PLZ-basierte Stadtauswahl
  - Auswahl verschiedener Zahlungsarten: PayPal, Stripe (Kreditkarte), Klarna, Nachnahme
  - Lagerbestandsprüfung vor Bestellung, automatische Aktualisierung des Bestands
  - Übersichtliche Bestellübersicht und Bestätigungsmail via EmailJS

- **Nutzerkonto:**

  - Registrierung, Login, Passwort anzeigen / zurücksetzen
  - Verwaltung von Adressen (Liefer- und Rechnungsadressen)
  - Anzeige der Bestellhistorie mit Details zu jeder Bestellung

- **Responsives Design:** Optimiert für Desktop, Tablet und Smartphone

### 🛠️ Admin-Dashboard

- **Produktverwaltung:**

  - Erstellen, Bearbeiten, Löschen von Produkten
  - Pflege von Varianten (Farben, Größen) und Lagerbeständen
  - Hochladen und Verwalten von Bildern pro Farbe
  - Automatische Statusänderung zu „ausverkauft“ bei leerem Lager

- **Import & Export:**

  - JSON-basierte Produkt-Daten-Backup und Importfunktion
  - Vorschau vor dem Import

- **Bestellübersicht:**

  - Übersicht aller eingegangenen Bestellungen
  - Sortierung nach Datum, Filterung nach Status

- **Benutzerverwaltung:**

  - Einsehen und Verwalten von Nutzerrollen (Admin, Kunde)

- **Live-Daten:** Echtzeit-Updates dank Firestore onSnapshot

---

## 3. Technologie-Stack

| Bereich              | Technologie/Tool            | Beschreibung                                 |
| -------------------- | --------------------------- | -------------------------------------------- |
| Frontend             | React (Vite)                | Moderne UI-Bibliothek mit schnellem Bundling |
| Styling              | CSS / CSS Modules           | Gestaltung und Layout                        |
| Authentifizierung    | Firebase Authentication     | Nutzeranmeldung und Autorisierung            |
| Datenbank            | Firebase Firestore          | NoSQL-Datenbank für Produkte, Nutzer, Orders |
| Storage              | Firebase Storage            | Speicherung von Bildern und Assets           |
| Zahlungsabwicklung   | Stripe                      | Kreditkartenzahlungen via Payment Intents    |
| Zahlungsabwicklung   | PayPal                      | PayPal Checkout Integration                  |
| Zahlungsabwicklung   | Klarna                      | Rechnungskauf & Sofortüberweisung            |
| E-Mail Versand       | EmailJS                     | Versand von Bestellbestätigungen             |
| Backend Stripe API   | Node.js Server              | Erstellung von Payment Intents               |
| Hosting & Deployment | Vercel / Netlify (optional) | Deployment des Frontends und Backends        |

---

## 4. Projektstruktur

```plaintext
frontend/
├── public/               # Statische Dateien & Assets
├── src/
│   ├── Pages/            # React Seiten (Shop, Checkout, Profile, Admin)
│   ├── components/       # Wiederverwendbare UI-Komponenten
│   ├── contexts/         # Auth & Cart Contexts
│   ├── firebase/         # Firebase Konfiguration
│   ├── hooks/            # Custom React Hooks
│   ├── scripts/          # Hilfsskripte (Produktimport, Lagerupdate)
│   └── css/              # Stylesheets
├── stripe-server/        # Express Backend für Stripe
├── App.jsx               # Haupt-App Komponente
├── main.jsx              # Einstiegspunkt
└── vite.config.js        # Vite Konfiguration

---

5.Installation & Setup

Voraussetzungen
- Node.js (≥16) & npm
- Firebase Projekt mit Firestore, Auth und Storage
- Stripe Developer Account & API-Schlüssel
- PayPal Sandbox- oder Live-Konto
- EmailJS Account mit Service- und Template-ID

### Quickstart
  git clone https://github.com/dein-username/sugar-glider-merch.git
  cd sugar-glider-merch/frontend
  npm install
  npm run dev


Umgebungsvariablen
Das Projekt nutzt zwei .env Dateien:

1. Frontend .env (im frontend Ordner)
2. Backend Stripe Server .env (im stripe-server Ordner)

Firebase-Projekt anlegen
- Firestore, Authentication, Storage aktivieren
- API Keys und Konfigurationsdaten bereithalten
- Die Firebase API Keys sind im Code in der Datei src/firebase/firebaseConfig.js hinterlegt und müssen dort gepflegt werden.

EmailJS KEY und TEMPLATE eintragen in E-commerce/frontend/src/Page/Checkout.jsx
- Ein Beispiel für ein Template ist in E-commerce/frontend/template.txt
- Row 20 emailjs.init("DEIN PUBLIC KEY");
- Row 290  await emailjs.send("service_sugarglidermerch", "TEMPLATE ID", {

Backend Stripe Server starten

cd ../stripe-server
npm install
node src/stripe-server/server.js
node server.js

---

## 6. Sicherheit & Rollen

### Firestore Regeln

Die Regeln befinden sich in E-commerce/frontend/Rules.txt

- Nur authentifizierte Nutzer haben Zugriff auf eigene Daten
- Admins können Produkte, Bestellungen, Nutzer vollständig verwalten
- Firestore Security Rules sichern sensible Daten und verhindern unberechtigten Zugriff
- Lagerbestände werden vor Bestellabschluss validiert

---

## 7. Ausblick & Erweiterungen

- ✅ Multi-Image-Unterstützung pro Variante ✔
- 🔜 Produkt-Bewertungen & Kommentare
- 🔜 Admin-Benachrichtigungen per Mail
- 🔜 Lagerstand-Analytics im Dashboard
- 🔜 Mobile-optimierte Benutzeroberfläche
- 🔜 Rabatt- & Gutscheinsystem
- 🔜 Mehrsprachigkeit (i18n)
- 🔜 CMS-Anbindung für Produktpflege
- 🔜 Progressive Web App (Offline-Modus)

---

## 8. Screenshots

_Hinweis: Screenshots befinden sich im Ordner `/assets/screenshots/` oder können bei Bedarf eingebunden werden._

---

## 9. Lizenz

Dieses Projekt ist ausschließlich für Portfolio- & Lernzwecke freigegeben. Kein produktiver Einsatz ohne Lizenzklärung mit dem Entwickler.

---


## 10. Kontakt

Fragen, Feedback oder Interesse am Code?
**[LinkedIn-Profil oder Mailadresse hier ergänzen]**
```

---

## 11. React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
