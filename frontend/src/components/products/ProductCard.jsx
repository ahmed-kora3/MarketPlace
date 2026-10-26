/**
 * ProductCard.jsx
 *
 * Displays a single product in the product grid.
 *
 * Props:
 *  product   — product object from the API
 *  isFavorite — boolean
 *  onFavorite — (id) => void  — called when the heart button is clicked
 */

import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import ProductArtwork from "./ProductArtwork";

export default function ProductCard({ product, isFavorite, onFavorite }) {
  const path  = `/products/${product.id}`;
  const stock = Number(product.stock) || 0;

  const handleFavorite = (e) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();
    onFavorite?.(product.id);
  };

  return (
    <article className="product-card" aria-label={product.name}>
      {/* Favorite toggle */}
      <button
        className={`product-card__favorite${isFavorite ? " is-favorite" : ""}`}
        onClick={handleFavorite}
        aria-label={isFavorite ? `إزالة ${product.name} من المفضلة` : `إضافة ${product.name} للمفضلة`}
        aria-pressed={isFavorite}
      >
        <Heart size={17} fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
      </button>

      {/* Image area */}
      <Link to={path} className="product-card__image-link" tabIndex={-1} aria-hidden="true">
        <div className="product-card__image-wrap">
          <ProductArtwork product={product} />

          {/* Stock badges */}
          {stock > 0 && stock <= 5 && (
            <span className="stock-badge" aria-label="كمية محدودة">
              كمية محدودة
            </span>
          )}
          {stock <= 0 && (
            <span className="stock-badge stock-badge--out" aria-label="نفد المخزون">
              نفد المخزون
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="product-card__info">
        <span className="product-card__category">
          {product.category?.name || "منتجات يدوية"}
        </span>

        <Link to={path} className="product-card__title">
          {product.name}
        </Link>

        <span className="product-card__seller" aria-label={`الصانع: ${product.seller?.name || "صانع مستقل"}`}>
          <span className="seller-dot" aria-hidden="true" />
          {product.seller?.name || "صانع مستقل"}
        </span>

        <div className="product-card__footer">
          <div className="product-price">
            <span className="product-price__amount" dir="ltr">
              {formatPrice(product.price)}
            </span>
            <span className="product-price__currency">وحدة نقدية</span>
          </div>

          <Link
            to={path}
            className="product-card__detail-btn"
            aria-label={`عرض تفاصيل ${product.name}`}
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
