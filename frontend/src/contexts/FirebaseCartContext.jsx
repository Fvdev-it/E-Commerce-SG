import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { db } from "../firebase/firebaseConfig";

const FirebaseCartContext = createContext();

export const useCart = () => useContext(FirebaseCartContext);

export function FirebaseCartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, "carts", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCart(docSnap.data().items || []);
        } else {
          setCart([]);
        }
      } else {
        setUserId(null);
        setCart([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveCart = async (newCart) => {
    if (!userId) return;
    try {
      const docRef = doc(db, "carts", userId);
      await setDoc(docRef, { items: newCart });
    } catch (error) {
      console.error("Fehler beim Speichern des Warenkorbs:", error);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(
      (i) => i.id === item.id && i.color === item.color && i.size === item.size
    );
    const updated = existing
      ? cart.map((i) =>
          i.id === item.id && i.color === item.color && i.size === item.size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      : [...cart, { ...item, quantity: 1 }];
    setCart(updated);
    saveCart(updated);
  };

  const removeFromCart = (id, color, size = null) => {
    const updated = cart.filter(
      (item) =>
        item.id !== id || item.color !== color || (size && item.size !== size)
    );
    setCart(updated);
    saveCart(updated);
  };

  const updateQuantity = (id, quantity, color, size = null) => {
    const updated = cart.map((item) =>
      item.id === id &&
      item.color === color &&
      (size ? item.size === size : true)
        ? { ...item, quantity }
        : item
    );
    setCart(updated);
    saveCart(updated);
  };

  const clearCart = async () => {
    if (userId) {
      await setDoc(doc(db, "carts", userId), { items: [] });
    }
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <FirebaseCartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </FirebaseCartContext.Provider>
  );
}
