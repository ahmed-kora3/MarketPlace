/**
 * Footer.jsx
 *
 * Site footer with brand identity, brief tagline, and
 * a scroll-to-top control. Copyright line at the bottom.
 */

import { ShoppingBag } from "lucide-react";

export default function Footer() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="site-footer">
      <div className="footer-inner container container--wide">
        <div className="footer-brand-col">
          <a href="/" className="brand footer-brand" aria-label="حِرفة الرئيسية">
            <span className="brand-mark" aria-hidden="true">
              <ShoppingBag size={21} strokeWidth={1.8} />
              <span className="brand-sparkle">✦</span>
            </span>
            <span className="brand-text">
              <strong>حِرفة</strong>
              <small>HANDMADE MARKET</small>
            </span>
          </a>
          <p className="footer-tagline">
            مكان يجمع الإبداع، الحِرفة، والقطع التي لها روح.
          </p>
        </div>

        <nav className="footer-nav" aria-label="روابط التذييل">
          <span className="footer-nav-title">استكشف</span>
          <a href="/#categories">الأقسام</a>
          <a href="/#products">المنتجات</a>
          <a href="/#about">عن المتجر</a>
        </nav>

        <div className="footer-top-col">
          <button
            className="footer-top-btn"
            onClick={scrollTop}
            aria-label="العودة إلى أعلى الصفحة"
          >
            للأعلى ↑
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container container--wide footer-bottom-inner">
          <span>© {new Date().getFullYear()} حِرفة — Handmade Market</span>
          <span>صُنع بحب لدعم الإبداع المستقل</span>
        </div>
      </div>
    </footer>
  );
}
