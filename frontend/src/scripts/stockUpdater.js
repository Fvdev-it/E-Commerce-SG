// src/scripts/stockUpdater.js

// Importiere benötigte Firestore-Funktionen
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Firebase-Datenbankinstanz

/**
 * Reduziert den Lagerbestand für die im Warenkorb enthaltenen Produkte.
 * @param {Array} cartItems - Array von Warenkorb-Items mit id, color, quantity und optional size.
 */
export const decreaseProductStock = async (cartItems) => {
  for (const item of cartItems) {
    // Referenz auf das Produkt-Dokument in Firestore
    const productRef = doc(db, "products", item.id);

    // Dynamischer Pfad zum Lagerbestand je nach Produkttyp (mit oder ohne Größen)
    const stockPath = item.size
      ? `stock.${item.color}.${item.size}` // z. B. stock["#000"]["M"]
      : `stock.${item.color}`; // z. B. stock["#000"]

    try {
      // Verringere den Lagerbestand um die Anzahl im Warenkorb
      await updateDoc(productRef, {
        [stockPath]: increment(-item.quantity),
      });

      // Erfolgsmeldung in der Konsole
      console.log(
        `✔️ Lagerbestand aktualisiert: ${item.id} (${item.color}${
          item.size ? " - " + item.size : ""
        })`
      );
    } catch (err) {
      // Fehlerausgabe, falls das Update fehlschlägt
      console.error(`❌ Fehler beim Update von ${item.id}:`, err);
    }
  }
};
