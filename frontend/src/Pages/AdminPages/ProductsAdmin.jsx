import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../css/ProductsAdmin.css";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [deletedProduct, setDeletedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    titel: "",
    id: "",
    category: "",
    colors: [],
    imageMap: {},
    price: "",
    rating: "",
    sale: false,
    isClothing: false,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const updateStock = async (productId, color, size, delta) => {
    const productRef = doc(db, "products", productId);
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const currentStock = { ...product.stock };
    if (typeof currentStock[color] !== "object") {
      currentStock[color] = currentStock[color] ?? 0;
    }

    const currentQty =
      typeof currentStock[color] === "object"
        ? currentStock[color][size] ?? 0
        : currentStock[color];
    const newQty = Math.max(0, currentQty + delta);

    if (typeof currentStock[color] === "object") {
      currentStock[color][size] = newQty;
      await updateDoc(productRef, {
        [`stock.${color}.${size}`]: newQty,
      });
    } else {
      await updateDoc(productRef, {
        [`stock.${color}`]: newQty,
      });
    }
  };

  const deleteProduct = async (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const confirmed = window.confirm(
      "❗ Willst du dieses Produkt wirklich löschen?"
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "products", productId));
      setDeletedProduct(product);
      setTimeout(() => setDeletedProduct(null), 5000);
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  const undoDelete = async () => {
    if (deletedProduct) {
      const { id, ...rest } = deletedProduct;
      await setDoc(doc(db, "products", id), rest);
      setDeletedProduct(null);
    }
  };

  const exportProducts = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileInput = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      setImportPreview(importedData);
    } catch (error) {
      alert("Fehler beim Einlesen der Datei.");
      console.error(error);
    }
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    setIsImporting(true);
    try {
      for (const product of importPreview) {
        if (!product.id) continue;
        const { id, ...rest } = product;
        await setDoc(doc(db, "products", id), rest, { merge: true });
      }
      alert("Produkte importiert.");
    } catch (error) {
      console.error("Fehler beim Import:", error);
    } finally {
      setImportPreview(null);
      setIsImporting(false);
    }
  };

  const handleNewProduct = async () => {
    const { titel, id, category, colors, price, rating, sale, isClothing } =
      newProduct;
    if (!titel || !id) return alert("Titel und ID erforderlich");

    const colorList =
      Array.isArray(colors) && colors.length > 0 ? colors : ["#000"];
    const defaultSizes = isClothing
      ? ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
      : [];

    const stock = {};
    const imageMap = {};

    for (const color of colorList) {
      if (defaultSizes.length > 0) {
        stock[color] = {};
        for (const size of defaultSizes) {
          stock[color][size] = 0;
        }
      } else {
        stock[color] = 0;
      }
      imageMap[color] = "/assets/placeholder.png";
    }

    const product = {
      titel,
      id,
      category: category || "Andere",
      colors: colorList,
      sizes: defaultSizes,
      price: parseFloat(price) || 0,
      rating: parseInt(rating) || 0,
      sale: !!sale,
      isClothing: !!isClothing,
      createdAt: new Date(),
      imageMap: newProduct.imageMap,
      stock,
    };

    try {
      await setDoc(doc(db, "products", id), product);
      setNewProduct({
        titel: "",
        id: "",
        category: "",
        colors: [],
        price: "",
        rating: "",
        sale: false,
        isClothing: false,
      });
    } catch (err) {
      console.error("Fehler beim Hinzufügen:", err);
      alert("Fehler beim Hinzufügen des Produkts.");
    }
  };

  const getColorName = (hex) => {
    const map = {
      "#fff": "Weiß",
      "#6e7fa2": "Blau",
      "#6e6d69": "Grau",
      "#000": "Schwarz",
      "#c0c0c0": "Silber",
      "#353c40": "Marin Blau",
      "#E7d7be": "Sand",
      "#0589b8": "Hellblau",
      "#bf2d30": "Rot",
      "#0d0f2d": "Dunkle Blau",
      "#7c7c7c": "Hell Grau",
      "#80020d": "Dunkel Rot",
      "#546c89": "Grau Blau",
      "#00ff00": "Grün",
      "#2f3c4c": "Blau Grau",
      "#d4c7b3": "Weißer Sand",
      "#28472f": "Wald Grün",
      "#3b5268": "Marin Blau Hell",
      "#a19f44": "Oka",
      "#ff681f": "Orange",
      "#ff00ff": "Rosa",
    };
    return map[hex] || hex;
  };
  return (
    <div className="products-admin">
      <h2>🛠 Produkte verwalten</h2>

      <div className="import-export-buttons">
        <button onClick={exportProducts}>📤 Exportieren</button>
        <button onClick={() => document.getElementById("fileInput").click()}>
          📥 Importieren
        </button>
        <input
          type="file"
          accept=".json"
          onChange={handleFileInput}
          id="fileInput"
          style={{ display: "none" }}
        />
      </div>

      <input
        type="text"
        placeholder="🔍 Produkt suchen..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem", maxWidth: "400px" }}
      />

      <div className="product-card">
        <h4>➕ Neues Produkt Hinzufügen</h4>
        <input
          type="text"
          placeholder="Titel"
          value={newProduct.titel}
          onChange={(e) =>
            setNewProduct({ ...newProduct, titel: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="ID"
          value={newProduct.id}
          onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
        />
        <select
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
        >
          <option value="">Kategorie wählen...</option>
          <option value="Top Sales">Top Sales</option>
          <option value="New Arrivals">New Arrivals</option>
          <option value="Andere">Andere</option>
        </select>

        <select
          value=""
          onChange={(e) => {
            const selected = e.target.value;
            if (
              selected &&
              !newProduct.colors.includes(selected) &&
              newProduct.colors.length < 5
            ) {
              setNewProduct({
                ...newProduct,
                colors: [...newProduct.colors, selected],
              });
            }
          }}
        >
          <option value="">Farbe wählen...Max 5.</option>
          <option value="#000">Schwarz</option>
          <option value="#fff">Weiß</option>
          <option value="#ff0000">Rot</option>
          <option value="#0000ff">Blau</option>
          <option value="#008000">Grün</option>
          <option value="#ffff00">Gelb</option>
          <option value="#800080">Lila</option>
          <option value="#ffa500">Orange</option>
          <option value="#f5deb3">Sand</option>
        </select>
        {newProduct.colors.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <h5 style={{ marginBottom: "0.5rem" }}>📸 Bild-Links pro Farbe:</h5>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#555",
                marginBottom: "1rem",
              }}
            >
              🔍 Empfohlene Größe: <strong>600×600px</strong> – JPG/PNG/WebP
            </p>

            {newProduct.colors.map((color) => (
              <div key={color} className="color-image-input">
                <div className="color-label">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      title={`${getColorName(color)} (${color})`}
                    />
                    <span>
                      {getColorName(color)} ({color})
                    </span>
                  </div>
                  <button
                    className="color-remove-button"
                    onClick={() =>
                      setNewProduct({
                        ...newProduct,
                        colors: newProduct.colors.filter((c) => c !== color),
                        imageMap: Object.fromEntries(
                          Object.entries(newProduct.imageMap).filter(
                            ([key]) => key !== color
                          )
                        ),
                      })
                    }
                    title="Farbe entfernen"
                  >
                    ✕ Entfernen
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Bild-URL für diese Farbe"
                  value={newProduct.imageMap[color] || ""}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      imageMap: {
                        ...newProduct.imageMap,
                        [color]: e.target.value,
                      },
                    })
                  }
                />

                {newProduct.imageMap[color] && (
                  <img
                    src={newProduct.imageMap[color]}
                    alt={color}
                    className="color-image-preview"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <input
          type="number"
          placeholder="Preis"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Bewertung (1–5)"
          min="1"
          max="5"
          value={newProduct.rating}
          onChange={(e) =>
            setNewProduct({ ...newProduct, rating: e.target.value })
          }
        />
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={newProduct.isClothing}
              onChange={(e) =>
                setNewProduct({ ...newProduct, isClothing: e.target.checked })
              }
            />
            Kleidung
          </label>
          <label>
            <input
              type="checkbox"
              checked={newProduct.sale}
              onChange={(e) =>
                setNewProduct({ ...newProduct, sale: e.target.checked })
              }
            />
            Sale
          </label>
        </div>

        <br />
        <button onClick={handleNewProduct} style={{ marginTop: "0.5rem" }}>
          ➕ Hinzufügen
        </button>
      </div>

      {importPreview && (
        <div className="product-card" style={{ background: "#fff8e1" }}>
          <h3>📋 Import-Vorschau ({importPreview.length} Produkte)</h3>
          {importPreview.map((p) => (
            <div key={p.id}>
              <strong>{p.titel}</strong> <small>({p.id})</small>
            </div>
          ))}
          <div style={{ marginTop: "1rem" }}>
            <button onClick={confirmImport} disabled={isImporting}>
              ✅ Import durchführen
            </button>
            <button
              onClick={() => setImportPreview(null)}
              style={{ marginLeft: "0.5rem" }}
            >
              ❌ Abbrechen
            </button>
          </div>
        </div>
      )}

      {deletedProduct && (
        <div className="product-card" style={{ background: "#ffe0e0" }}>
          <strong>Produkt gelöscht:</strong> {deletedProduct.titel} (
          {deletedProduct.id})
          <button onClick={undoDelete} style={{ marginLeft: "1rem" }}>
            ↩️ Rückgängig
          </button>
        </div>
      )}
      {products
        .filter(
          (p) =>
            p.titel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((p) => (
          <div key={p.id} className="product-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>
                {p.titel} <small>({p.id})</small>{" "}
                <span style={{ fontSize: "0.85rem", color: "#888" }}>
                  ({p.category})
                </span>
              </h3>
              <button
                onClick={() => deleteProduct(p.id)}
                style={{ background: "#dc3545" }}
              >
                🗑️ Löschen
              </button>
            </div>

            {p.stock && typeof p.stock === "object" ? (
              <div className="color-grid">
                {(p.colors || Object.keys(p.stock)).map((color) => {
                  const sizes = p.stock[color];
                  const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

                  return (
                    <div key={color} className="color-card">
                      <div className="color-label">
                        <div
                          className="color-swatch"
                          style={{ backgroundColor: color }}
                          title={`${getColorName(color)} (${color})`}
                        />
                        <span>
                          Farbe: {getColorName(color)} ({color})
                        </span>
                      </div>

                      {typeof sizes === "object" ? (
                        allSizes.map((size) => (
                          <div key={size} className="size-row">
                            <span>
                              {size}: {sizes[size] ?? 0}
                            </span>
                            <button
                              onClick={() => updateStock(p.id, color, size, 1)}
                            >
                              +1
                            </button>
                            <button
                              onClick={() => updateStock(p.id, color, size, -1)}
                            >
                              -1
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="size-row">
                          <span>Menge: {sizes}</span>
                          <button
                            onClick={() =>
                              updateStock(p.id, color, "default", 1)
                            }
                          >
                            +1
                          </button>
                          <button
                            onClick={() =>
                              updateStock(p.id, color, "default", -1)
                            }
                          >
                            -1
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>❌ Kein Stock-Datensatz vorhanden</p>
            )}
          </div>
        ))}
    </div>
  );
}
