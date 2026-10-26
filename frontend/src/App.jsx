/**
 * App.jsx
 *
 * Application root: routing, shared state, and layout composition.
 *
 * Responsibilities:
 *  - Route declarations
 *  - Shared data (products, categories) via useProducts()
 *  - Cart state via useCart()
 *  - Favorites state (UI-only, no backend sync yet)
 *  - Passing data down to page components
 *  - Rendering the Header and Footer on every route
 *
 * This file intentionally has no business logic or UI rendering.
 * All page content lives in src/pages/*.jsx.
 */

import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import AnnouncementBar from "./components/layout/AnnouncementBar";
import Header          from "./components/layout/Header";
import Footer          from "./components/layout/Footer";

import HomePage           from "./pages/HomePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage           from "./pages/CartPage";
import NotFoundPage       from "./pages/NotFoundPage";

import { useProducts } from "./hooks/useProducts";
import { useCart }     from "./hooks/useCart";

export default function App() {
  /* ── Shared data ── */
  const { products, categories, loading, error, reload } = useProducts();

  /* ── Cart ── */
  const {
    cartItems,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  /* ── Favorites (UI-only; no backend sync) ── */
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  /* ── Navigation helpers ── */
  const navigate = useNavigate();

  const handleCartClick = () => navigate("/cart");

  const handleSearchFocus = () => {
    if (window.location.pathname !== "/") {
      navigate("/");
      // Give React Router a tick to render the home page before scrolling.
      setTimeout(() => {
        document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ── Add to cart with consistent return value ── */
  const handleAddToCart = (product, quantity) => {
    return addToCart(product, quantity);
  };

  return (
    <>
      <AnnouncementBar />

      <Header
        favorites={favorites}
        cartCount={cartCount}
        onCartClick={handleCartClick}
        onSearchFocus={handleSearchFocus}
      />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              categories={categories}
              loading={loading}
              error={error}
              onReload={reload}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAddToCart={handleAddToCart}
            />
          }
        />

        {/* Product detail */}
        <Route
          path="/products/:id"
          element={
            <ProductDetailsPage
              products={products}
              loading={loading}
              onAddToCart={handleAddToCart}
              favorites={favorites}
              onFavorite={toggleFavorite}
            />
          }
        />

        {/* Cart */}
        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
              onClear={clearCart}
            />
          }
        />

        {/* 404 */}
        <Route path="/not-found" element={<NotFoundPage />} />

        {/* Catch-all → 404 page (preserve URL so user can share it) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
}
