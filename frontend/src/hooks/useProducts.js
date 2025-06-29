import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        try {
          const fetched = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              isOutOfStock: data.stock !== undefined && data.stock <= 0,
            };
          });
          setProducts(fetched);
          setLoading(false);
        } catch (err) {
          console.error("❌ Fehler beim Verarbeiten der Produktdaten:", err);
          setError("Fehler beim Laden der Produkte");
          setLoading(false);
        }
      },
      (err) => {
        console.error("❌ Fehler beim Laden aus Firestore:", err);
        setError("Verbindung zu Firestore fehlgeschlagen");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { products, loading, error };
}
