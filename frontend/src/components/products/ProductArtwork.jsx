/**
 * ProductArtwork.jsx
 *
 * Decorative SVG/emoji artwork displayed when a product has no real image.
 * The artwork is category-aware (jewelry, pottery, etc.).
 *
 * Props:
 *  product  — product object with optional .category field
 *  large    — render at a larger size (for detail pages)
 */

import { getCategoryArt } from "../../utils/formatters";

export default function ProductArtwork({ product, large = false }) {
  const art = getCategoryArt(product?.category);
  const label = product?.category?.name || "المنتج";

  return (
    <div
      className={`product-art ${art.className}${large ? " product-art--large" : ""}`}
      role="img"
      aria-label={`رسم توضيحي لفئة ${label}`}
    >
      <span className="art-orbit art-orbit--one" aria-hidden="true" />
      <span className="art-orbit art-orbit--two" aria-hidden="true" />
      <span className="art-sparkle art-sparkle--one" aria-hidden="true">✦</span>
      <span className="art-sparkle art-sparkle--two" aria-hidden="true">✧</span>
      <span className="art-emoji" aria-hidden="true">{art.icon}</span>
      <span className="art-caption" aria-hidden="true">HANDMADE WITH LOVE</span>
    </div>
  );
}
