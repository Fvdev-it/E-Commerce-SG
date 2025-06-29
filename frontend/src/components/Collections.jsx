import React from "react";
import "../css/Collections.css";

import bild1 from "../assets/...";
import bild2 from "../assets/...";
import bild3 from "../assets/...";

export default function Collections() {
  const items = [
    {
      title: "Anziehsachen",
      img: bild1,
    },
    {
      title: "Gebrauchsgegenstände",
      img: bild2,
    },
    {
      title: "Accessories",
      img: bild3,
    },
  ];

  return (
    <section className="collections" id="collections">
      <div className="collections-container">
        {items.map((item, index) => (
          <div className="collections-box hover-box" key={index}>
            <img src={item.img} alt={item.title} />
            <div className="overlay-content">
              <p>{item.title}</p>
              <a href="#sellers" className="shop-now">
                SHOP NOW
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
