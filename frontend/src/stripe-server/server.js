// frontend/src/stripe-server/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Sicherer Zugriff über env

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("❌ Stripe Error:", err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(4242, () => {
  console.log("✅ Stripe-Server läuft unter http://localhost:4242");
  console.log("🔑 STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
});
