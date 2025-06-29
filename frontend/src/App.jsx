import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./css/global.css";
import "boxicons/css/boxicons.min.css";

// Komponenten
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import Collections from "./components/Collections";
import Sellers from "./components/Sellers";
import News from "./components/News";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

// Seiten
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import OrderConfirmation from "./Pages/OrderConfirmation";
import MyOrders from "./Pages/MyOrders";
import Profile from "./Pages/Profile";

// Admin Layout + Admin-Seiten
import AdminLayout from "./Pages/AdminPages/AdminLayout";
import AdminDashboard from "./Pages/AdminPages/AdminDashboard";
import ProductsAdmin from "./Pages/AdminPages/ProductsAdmin";
import OrdersAdmin from "./Pages/AdminPages/OrdersAdmin";
import ImportPage from "./Pages/AdminPages/ImportPage";

// Context
import { FirebaseCartProvider } from "./contexts/FirebaseCartContext";
import { AuthProvider } from "./contexts/AuthContext";

function HomePage() {
  return (
    <>
      <NavBar />
      <HeroSection />
      <Collections />
      <Sellers />
      <News />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <FirebaseCartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/meine-bestellungen" element={<MyOrders />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="produkte" element={<ProductsAdmin />} />
              <Route path="bestellungen" element={<OrdersAdmin />} />
              <Route path="import" element={<ImportPage />} />
            </Route>
          </Routes>
        </Router>
      </FirebaseCartProvider>
    </AuthProvider>
  );
}

export default App;
