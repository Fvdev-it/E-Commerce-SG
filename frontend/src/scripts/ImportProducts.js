// Importiere benötigte Funktionen und die Datenbankinstanz aus Firebase
import { db } from "../firebase/firebaseConfig";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";

// Zwei Beispielprodukte mit unterschiedlichen Strukturen (eines mit Größen, eines ohne)
const products = [
  {
    id: "Tasse",
    data: {
      titel: "Tasse",
      price: 14.95,
      rating: 5,
      sale: false,
      category: "Top Sales",
      colors: ["#000", "#ff681f", "#a19f44"], // Verfügbare Farbvarianten
      imageMap: {
        // Farbabhängige Produktbilder
        "#000": "/assets/Merch/tasse/bildblack.png",
        "#ff681f": "/assets/Merch/tasse/bildorange.png",
        "#a19f44": "/assets/Merch/tasse/bildgreen.png",
      },
      stock: {
        // Lagerbestand pro Farbe
        "#000": 20,
        "#ff681f": 15,
        "#a19f44": 10,
      },
    },
  },

  {
    id: "Hoodie",
    data: {
      titel: "Hoodie",
      price: 34.95,
      sizes: ["L", "M", "S", "XL", "XS", "XXL", "XXXL"], // Verfügbare Größen
      rating: 5,
      sale: false,
      category: "Top Sales",
      colors: ["#000", "#353c40", "#E7d7be"],
      imageMap: {
        // Farbabhängige Produktbilder - Direkt aus dem Public assets Ordner oder web.
        "#000": "/assets/Merch/hoodie/bildblack.png",
        "#353c40": "/assets/Merch/hoodie/bildanth.png",
        "#E7d7be": "/assets/Merch/hoodie/bildsand.png",
      },
      stock: {
        // Lagerbestand je Farbe und Größe (verschachtelte Struktur)
        "#000": { XS: 0, S: 0, M: 5, L: 5, XL: 3, XXL: 2, XXXL: 0 },
        "#353c40": { XS: 0, S: 3, M: 2, L: 0, XL: 0, XXL: 0, XXXL: 0 },
        "#E7d7be": { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 4 },
      },
    },
  },
];

// Funktion zum Importieren der Produkte in die Firestore-Datenbank
export const importProducts = async () => {
  for (const product of products) {
    try {
      // Referenz auf das Dokument in der Collection "products"
      const docRef = doc(db, "products", product.id);

      // Prüfung, ob der Stock eine verschachtelte Struktur (z. B. Kleidung mit Größen) hat
      const isNestedStock =
        typeof product.data.stock === "object" &&
        Object.values(product.data.stock).some(
          (value) => typeof value === "object" && value !== null
        );

      // Payload für die Datenbank mit zusätzlichem Timestamp und Typ-Kennzeichnung
      const payload = {
        ...product.data,
        createdAt: serverTimestamp(), // Firebase-Timestamp für "erstellt am"
        isClothing: isNestedStock, // Kennzeichnung, ob es sich um Kleidung handelt
      };

      // Produkt in Firestore speichern
      await setDoc(docRef, payload);

      // Erfolgsmeldung in der Konsole
      console.log(`✅ Produkt ${product.id} erfolgreich importiert`);
    } catch (error) {
      // Fehlermeldung in der Konsole, falls etwas schiefläuft
      console.error(`❌ Fehler bei ${product.id}:`, error);
    }
  }
};
