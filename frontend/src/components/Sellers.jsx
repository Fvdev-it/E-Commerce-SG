import React, { useState, useEffect } from "react";
import "../css/Sellers.css";
import { useCart } from "../contexts/FirebaseCartContext";
import useProducts from "../hooks/useProducts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import Notification from "../components/Notification";

function ProductSection({ title, items, showNotification }) {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();

  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});

  const getQuantityInCart = (id, color, size = null) => {
    return cart.reduce((total, item) => {
      const matchId = item.id === id;
      const matchColor = item.color === color;
      const matchSize = size ? item.size === size : !item.size;
      return matchId && matchColor && matchSize ? total + item.quantity : total;
    }, 0);
  };

  const handleAddToCart = async (item) => {
    try {
      const productRef = doc(db, "products", item.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        showNotification("❌ Produkt existiert nicht");
        return;
      }

      const data = productSnap.data();
      const stock = data.stock || {};
      const isClothing = item.size !== undefined;

      let currentStock = 0;
      if (isClothing) {
        currentStock = stock[item.color]?.[item.size] ?? 0;
      } else {
        currentStock = stock[item.color] ?? 0;
      }

      const inCart = getQuantityInCart(item.id, item.color, item.size);
      if (inCart >= currentStock) {
        showNotification(
          `❌ Nur noch ${currentStock} Stück dieser Variante verfügbar – bereits im Warenkorb.`
        );
        return;
      }

      addToCart(item);
    } catch (err) {
      console.error("❌ Fehler beim Hinzufügen:", err);
      showNotification("Fehler beim Hinzufügen zum Warenkorb");
    }
  };

  return (
    <section className="sellers">
      <h2>{title}</h2>
      <div className="sellers-grid">
        {items.map((item) => {
          if (!item || !Array.isArray(item.colors) || item.colors.length === 0)
            return null;

          const isClothing = Array.isArray(item.sizes) && item.sizes.length > 0;
          const selectedColor = selectedColors[item.id] || item.colors[0];
          const availableSizes = item.sizes || [];
          const selectedSize = isClothing
            ? selectedSizes[item.id] ||
              availableSizes.find((s) => {
                const stock = item.stock?.[selectedColor]?.[s] ?? 0;
                return stock > 0;
              }) ||
              "M"
            : null;

          const imageSrc =
            item.imageMap?.[selectedColor] ||
            Object.values(item.imageMap || {})[0] ||
            "";

          const priceNumber = parseFloat(item.price ?? 0);
          const cartItem = {
            id: item.id,
            name: item.titel ?? "Unbenannt",
            price: priceNumber,
            image: imageSrc,
            color: selectedColor,
            ...(isClothing && { size: selectedSize }),
          };

          const quantity = getQuantityInCart(
            item.id,
            selectedColor,
            selectedSize
          );
          const isOutOfStock = isClothing
            ? (item.stock?.[selectedColor]?.[selectedSize] ?? 0) <= 0
            : (item.stock?.[selectedColor] ?? 0) <= 0;

          return (
            <div key={item.id} className="product-card">
              {item.sale && <span className="sale-tag">SALE</span>}
              <img src={imageSrc} alt={item.titel} width={320} height={320} />
              <h4>{item.titel}</h4>
              <div className="rating">
                {"★".repeat(item.rating || 0)}
                {"☆".repeat(5 - (item.rating || 0))}
              </div>
              <p className="price">{priceNumber.toFixed(2)} €</p>

              <div className="colors">
                {item.colors.map((color, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: color,
                      border:
                        selectedColor === color
                          ? "2px solid #000"
                          : "1px solid #ccc",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedColors((prev) => ({
                        ...prev,
                        [item.id]: color,
                      }));
                      setSelectedSizes((prev) => ({
                        ...prev,
                        [item.id]: null,
                      }));
                    }}
                  ></span>
                ))}
              </div>

              {isClothing && (
                <div className="sizes">
                  <label>Größe:</label>
                  <select
                    value={selectedSize}
                    onChange={(e) =>
                      setSelectedSizes((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                  >
                    {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => {
                      const stock = item.stock?.[selectedColor]?.[size] ?? 0;
                      return (
                        <option key={size} value={size} disabled={stock <= 0}>
                          {stock <= 0 ? `${size} (ausverkauft)` : size}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="button-group">
                <button
                  className="buy-btn"
                  onClick={() => handleAddToCart(cartItem)}
                  disabled={isOutOfStock}
                  style={{
                    opacity: isOutOfStock ? 0.5 : 1,
                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                  }}
                >
                  Hinzufügen zum Warenkorb
                </button>

                {quantity > 0 && (
                  <div className="qty-wrapper">
                    <span className="in-cart-text">Bereits im Korb:</span>
                    <div className="qty-control">
                      <button
                        onClick={() => {
                          const currentQty = getQuantityInCart(
                            item.id,
                            selectedColor,
                            selectedSize
                          );
                          if (currentQty > 1) {
                            updateQuantity(
                              item.id,
                              currentQty - 1,
                              selectedColor,
                              selectedSize
                            );
                          } else {
                            removeFromCart(
                              item.id,
                              selectedColor,
                              selectedSize
                            );
                          }
                        }}
                      >
                        -
                      </button>

                      <span>{quantity}</span>
                      <button onClick={() => handleAddToCart(cartItem)}>
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Sellers() {
  const { products, loading, error } = useProducts();
  const [notification, setNotification] = useState("");

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  if (loading) return <p className="loading">⏳ Produkte werden geladen...</p>;
  if (error) return <p className="error">❌ Fehler: {error}</p>;

  const topSales = products.filter((p) => p.category === "Top Sales");
  const newArrivals = products.filter((p) => p.category === "New Arrivals");
  const rest = products.filter(
    (p) => !["Top Sales", "New Arrivals"].includes(p.category)
  );

  return (
    <section id="sellers">
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification("")}
        />
      )}
      <ProductSection
        title="Top Sales"
        items={topSales}
        showNotification={showNotification}
      />
      <ProductSection
        title="New Arrivals"
        items={newArrivals}
        showNotification={showNotification}
      />
      <ProductSection
        title="Andere Merch Artikel"
        items={rest}
        showNotification={showNotification}
      />
    </section>
  );
}
