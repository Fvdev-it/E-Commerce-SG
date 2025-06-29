import React from "react";
import "../css/News.css";

import logo from "../assets/...";
import muetzeblack from "../assets/...";
import news3 from "../assets/...";
import news4 from "../assets/...";

function News() {
  return (
    <section className="news" id="news">
      <div className="center-text">
        <p className="section-label">LATEST NEWS</p>
        <h2>Merch Highlights</h2>
      </div>

      <div className="news-content container">
        {/* 1. Neuster Beitrag */}
        <div className="news-box">
          <img src={news3} alt="Kundenbilder" />
          <h5>🗓 21. Juni 2025</h5>
          <h3>Community-Pics: Eure Styles mit unserem Merch</h3>
          <p>
            Ihr seid der Wahnsinn! Hier sind unsere Lieblingsfotos aus der ...
          </p>
          <a href="#">read more</a>
        </div>

        {/* 2. Beitrag */}
        <div className="news-box">
          <img src={muetzeblack} alt="Mütze" />
          <h5>🗓 18. Juni 2025</h5>
          <h3>🔥 Mützen-Kollektion jetzt erhältlich</h3>
          <p>
            Ob Sommer oder Winter – mit unseren stylischen ... bist du immer gut
            ausgestattet.
          </p>
          <a href="#sellers">read more</a>
        </div>

        {/* 3. Beitrag */}
        <div className="news-box">
          <img src={news4} alt="Versand" />
          <h5>🗓 15. Juni 2025</h5>
          <h3>Kostenloser Versand ab 50 €</h3>
          <p>
            Bestellungen innerhalb Deutschlands ab 50 € liefern wir ab sofort
            versandkostenfrei.
          </p>
          <a href="#">read more</a>
        </div>

        {/* 4. Ältester Beitrag */}
        <div className="news-box">
          <img src={logo} alt="Shop Launch" />
          <h5>🗓 10. Juni 2025</h5>
          <h3>Der Merch-Shop ist live!</h3>
          <p>
            Nach monatelanger Vorbereitung ist unser offizieller Shop endlich
            gestartet. Entdecke limitierte Drops & mehr!
          </p>
          <a href="#">read more</a>
        </div>
      </div>
    </section>
  );
}

export default News;
