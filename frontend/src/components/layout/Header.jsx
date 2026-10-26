/**
 * Header.jsx
 *
 * Sticky site header with:
 * - Brand logo / name
 * - Main navigation links
 * - Search, Favorites, and Cart actions
 * - Responsive hamburger menu for mobile
 *
 * Props:
 *  favorites    — array of favorited product IDs
 *  cartCount    — total item units in cart
 *  onCartClick  — called when the cart button is pressed
 *  onSearchFocus — called when the search icon is pressed (scrolls to catalog)
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";

export default function Header({ favorites = [], cartCount = 0, onCartClick, onSearchFocus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleLogoClick = (e) => {
    // If already on home, just scroll to top
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    closeMenu();
  };

  return (
    <header className="site-header">
      <div className="header-inner container container--wide">
        {/* Hamburger — mobile only */}
        <button
          className="header-hamburger btn btn--ghost btn--icon"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand */}
        <Link
          to="/"
          className="brand"
          aria-label="حِرفة Handmade Market — الصفحة الرئيسية"
          onClick={handleLogoClick}
        >
          <span className="brand-mark" aria-hidden="true">
            <ShoppingBag size={22} strokeWidth={1.8} />
            <span className="brand-sparkle">✦</span>
          </span>
          <span className="brand-text">
            <strong>حِرفة</strong>
            <small>HANDMADE MARKET</small>
          </span>
        </Link>

        {/* Navigation */}
        <nav
          id="main-nav"
          className={`main-nav${menuOpen ? " main-nav--open" : ""}`}
          aria-label="التنقل الرئيسي"
        >
          <Link to="/" onClick={closeMenu}>الرئيسية</Link>
          <a
            href="/#categories"
            onClick={() => { closeMenu(); navigate("/"); setTimeout(() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" }), 80); }}
          >
            الأقسام
          </a>
          <a
            href="/#products"
            onClick={() => { closeMenu(); navigate("/"); setTimeout(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }), 80); }}
          >
            المنتجات
          </a>
          <a href="/#about" onClick={closeMenu}>عن المتجر</a>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <button
            className="btn btn--icon header-icon-btn"
            onClick={() => { onSearchFocus?.(); closeMenu(); }}
            aria-label="البحث في المنتجات"
          >
            <Search size={19} />
          </button>

          <button
            className="btn btn--icon header-icon-btn header-favorites-btn"
            onClick={() => { onSearchFocus?.(); closeMenu(); }}
            aria-label={`المفضلة — ${favorites.length} منتج`}
          >
            <Heart size={19} />
            {favorites.length > 0 && (
              <span className="header-badge" aria-hidden="true">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            className="header-cart-btn"
            onClick={onCartClick}
            aria-label={`سلة التسوق — ${cartCount} منتج`}
          >
            <ShoppingBag size={17} />
            <span className="header-cart-label">سلتي</span>
            {cartCount > 0 && (
              <span className="header-badge" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
