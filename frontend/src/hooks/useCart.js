/**
 * useCart.js
 *
 * Cart state management — localStorage-persisted, frontend-only.
 *
 * The backend cart API requires authentication (role:buyer).
 * Until auth is implemented in the frontend, the cart is maintained
 * in localStorage only. This is a documented limitation.
 * Stored prices are display snapshots; checkout must use server-side
 * product prices and stock as the source of truth.
 *
 * Returns:
 *  - cartItems:     array of { id, name, price, quantity, stock }
 *  - cartCount:     total unit count across all items
 *  - cartTotal:     grand total price
 *  - addToCart:     (product, quantity) => void
 *  - updateQuantity:(id, quantity) => void
 *  - removeFromCart:(id) => void
 *  - clearCart:     () => void
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { cartTotal, clamp } from "../utils/formatters";

const STORAGE_KEY = "hirfa-cart";

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      console.warn("Stored cart is not an array; ignoring it.");
      return [];
    }

    const items = parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];

      const stock = Math.floor(Number(item.stock));
      const quantity = Math.floor(Number(item.quantity));
      const price = Number(item.price);
      const validId =
        (typeof item.id === "number" && Number.isFinite(item.id)) ||
        (typeof item.id === "string" && item.id.trim() !== "");

      if (
        !validId ||
        typeof item.name !== "string" ||
        !Number.isFinite(stock) ||
        stock < 1 ||
        !Number.isFinite(quantity) ||
        quantity < 1 ||
        quantity > stock ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        return [];
      }

      return [{
        id: item.id,
        name: item.name,
        price,
        quantity,
        stock,
        category: typeof item.category === "string" ? item.category : null,
      }];
    });

    if (items.length !== parsed.length) {
      console.warn("Discarded invalid items from the stored cart.");
    }

    return items;
  } catch (error) {
    console.error("Failed to read cart from localStorage:", error);
    return [];
  }
}

export function useCart() {
  const [cartItems, setCartItems] = useState(readCart);
  const cartItemsRef = useRef(cartItems);

  const replaceCart = useCallback((nextItems) => {
    cartItemsRef.current = nextItems;
    setCartItems(nextItems);
  }, []);

  // Persist to localStorage whenever the cart changes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart:", err);
    }
  }, [cartItems]);

  /**
   * Add a product to the cart or increment its quantity.
   * Never exceeds available stock.
   *
   * @param {{ id, name, price, stock }} product
   * @param {number} quantity  Desired units to add (defaults to 1)
   * @returns {"added"|"updated"|"out_of_stock"}  Result token
   */
  const addToCart = useCallback((product, quantity = 1) => {
    const stock = Math.floor(Number(product.stock));
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));

    if (!Number.isFinite(stock) || stock < 1) return "out_of_stock";

    const current = cartItemsRef.current;
    const existing = current.find((item) => item.id === product.id);
    const productPrice = Number(product.price);
    const price =
      Number.isFinite(productPrice) && productPrice >= 0 ? productPrice : 0;

    if (existing) {
      const newQty = clamp(Number(existing.quantity) + qty, 1, stock);
      replaceCart(current.map((item) =>
        item.id === product.id
          ? { ...item, quantity: newQty, stock, price }
          : item
      ));
      return "updated";
    }

    replaceCart([
      ...current,
      {
        id:       product.id,
        name:     product.name,
        price,
        quantity: clamp(qty, 1, stock),
        stock,
        category: product.category?.name ?? null,
      },
    ]);
    return "added";
  }, [replaceCart]);

  /**
   * Set an explicit quantity for a cart item.
   * Removes the item when quantity reaches 0.
   *
   * @param {number|string} id
   * @param {number}        quantity
   */
  const updateQuantity = useCallback((id, quantity) => {
    const requestedQty = Number(quantity);

    if (!Number.isFinite(requestedQty)) return;

    if (requestedQty <= 0) {
      replaceCart(cartItemsRef.current.filter((item) => item.id !== id));
      return;
    }

    const qty = Math.floor(requestedQty);
    replaceCart(cartItemsRef.current.map((item) =>
      item.id === id
        ? { ...item, quantity: clamp(qty, 1, item.stock) }
        : item
    ));
  }, [replaceCart]);

  /**
   * Remove an item from the cart.
   *
   * @param {number|string} id
   */
  const removeFromCart = useCallback((id) => {
    replaceCart(cartItemsRef.current.filter((item) => item.id !== id));
  }, [replaceCart]);

  /** Remove all items from the cart. */
  const clearCart = useCallback(() => {
    replaceCart([]);
  }, [replaceCart]);

  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return {
    cartItems,
    cartCount,
    cartTotal: cartTotal(cartItems),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
