import React from "react";
import "../css/HeroSection.css";
import herosectionsg from "../assets/...";

function HeroSection() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-box">
        <img className="hero-image" src={herosectionsg} alt="Hero" />
        <div className="hero-overlay">
          <div className="hero-text">
            <p className="hero-collection">FIRST COLLECTION</p>
            <h2>
              First Merch <br /> Collection 2025
            </h2>
            <p className="hero-description">
              Entdecke unsere erste exklusive Merch-Kollektion – mit Liebe
              designt und mit Blick fürs Detail gefertigt. Stylisch, hochwertig
              und genau das Richtige für echte Supporter.
            </p>
            <a href="#sellers" className="hero-btn">
              Zuschlagen ! <i className="bx bx-right-arrow-alt"></i>
            </a>
            <div className="hero-social-icons">
              <a href="#">
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="#">
                <i className="bx bxl-twitter"></i>
              </a>
              <a href="#">
                <i className="bx bxl-pinterest"></i>
              </a>
              <a href="#">
                <i className="bx bxl-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
