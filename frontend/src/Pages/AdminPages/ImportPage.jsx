import React from "react";
import { importProducts } from "../../scripts/ImportProducts";

const ImportPage = () => {
  const handleImport = async () => {
    try {
      await importProducts();
      alert("✅ Produkte wurden erfolgreich importiert!");
    } catch (err) {
      alert("❌ Fehler beim Importieren: " + err.message);
      console.error(err);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "left",
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>📦 Produkte importieren</h1>

      <p style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "0.3rem" }}>
        <strong>Produkte werden importiert von:</strong>
      </p>
      <pre
        style={{
          background: "#f4f4f4",
          padding: "0.6rem 1rem",
          borderRadius: "6px",
          fontFamily: "monospace",
          fontSize: "0.95rem",
          marginBottom: "1.5rem",
        }}
      >
        src/scripts/ImportProducts.js
      </pre>

      <button
        onClick={handleImport}
        style={{
          padding: "0.8rem 1.6rem",
          fontSize: "1rem",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "background-color 0.2s ease-in-out",
        }}
      >
        🚀 Import starten
      </button>
    </div>
  );
};

export default ImportPage;
