/**
 * ProductSkeleton.jsx
 *
 * Shimmer placeholder shown while products are loading.
 * Matches the visual shape of ProductCard.
 *
 * Props:
 *  count — number of skeleton cards to render (default 8)
 */

export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className="products-grid" aria-busy="true" aria-label="جاري تحميل المنتجات">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i} aria-hidden="true">
          <div className="skeleton skeleton-card__image" />
          <div className="skeleton-card__body">
            <div className="skeleton skeleton-card__line skeleton-card__line--short" />
            <div className="skeleton skeleton-card__line" />
            <div className="skeleton skeleton-card__line skeleton-card__line--mid" />
          </div>
        </div>
      ))}
    </div>
  );
}
