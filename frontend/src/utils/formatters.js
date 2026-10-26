/**
 * formatters.js
 *
 * Shared utility functions for formatting data in the UI.
 * Keep these pure (no side effects, no imports).
 */

/**
 * Format a numeric price value as a 2-decimal string.
 * Returns an em-dash for invalid/missing values.
 *
 * @param {number|string} value
 * @returns {string}
 */
export function formatPrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Map a category object to a display emoji and CSS class name.
 * Used to generate illustrative artwork when no product image exists.
 *
 * @param {{ slug?: string, name?: string }} [category]
 * @returns {{ icon: string, className: string }}
 */
const CATEGORY_ART = {
  jewelry:  { icon: "💍", className: "art-jewelry" },
  pottery:  { icon: "🏺", className: "art-pottery" },
  paintings: { icon: "🎨", className: "art-paintings" },
  textiles: { icon: "🧶", className: "art-textiles" },
  woodwork: { icon: "🪵", className: "art-woodwork" },
};

const DEFAULT_ART = { icon: "✨", className: "art-default" };

/** Arabic keyword → category key mapping */
const ARABIC_KEYWORDS = [
  { terms: ["فخار", "خزف"],          key: "pottery"  },
  { terms: ["مجوهر", "حلي", "ذهب"],  key: "jewelry"  },
  { terms: ["لوح", "رسم", "لوحة"],   key: "paintings"},
  { terms: ["نسيج", "خيوط", "قماش"], key: "textiles" },
  { terms: ["خشب"],                   key: "woodwork" },
];

export function getCategoryArt(category) {
  if (!category) return DEFAULT_ART;

  const slug = (category.slug || "").toLowerCase();
  const name = (category.name || "").toLowerCase();

  // Match on English slug/name first
  for (const [key, art] of Object.entries(CATEGORY_ART)) {
    if (slug.includes(key) || name.includes(key)) {
      return art;
    }
  }

  // Match on Arabic keywords
  for (const { terms, key } of ARABIC_KEYWORDS) {
    if (terms.some((t) => name.includes(t))) {
      return CATEGORY_ART[key];
    }
  }

  return DEFAULT_ART;
}

/**
 * Clamp a number between min and max (inclusive).
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate the total price of a cart item.
 *
 * @param {{ price: number, quantity: number }} item
 * @returns {number}
 */
export function itemTotal(item) {
  return Number(item.price) * Number(item.quantity);
}

/**
 * Calculate the grand total of all cart items.
 *
 * @param {Array<{ price: number, quantity: number }>} items
 * @returns {number}
 */
export function cartTotal(items) {
  return items.reduce((sum, item) => sum + itemTotal(item), 0);
}
