
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCart } from "./useCart";

const STORAGE_KEY = "hirfa-cart";

const product = {
  id: 1,
  name: "Test Product",
  price: 100,
  stock: 5,
  category: { name: "Test Category" },
};

describe("useCart", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("adds a product to an empty cart", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      expect(result.current.addToCart(product, 2)).toBe("added");
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0]).toMatchObject({
      id: 1,
      name: "Test Product",
      price: 100,
      quantity: 2,
      stock: 5,
      category: "Test Category",
    });
    expect(result.current.cartCount).toBe(2);
    expect(result.current.cartTotal).toBe(200);
  });

  it("increments the quantity when the same product is added again", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(product, 2);
      result.current.addToCart(product, 1);
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(3);
  });

  it("does not allow quantity to exceed available stock", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(product, 4);
      result.current.addToCart(product, 4);
    });

    expect(result.current.cartItems[0].quantity).toBe(5);
  });

  it("returns out_of_stock when stock is zero", () => {
    const { result } = renderHook(() => useCart());

    let response;

    act(() => {
      response = result.current.addToCart(
        { ...product, stock: 0 },
        1
      );
    });

    expect(response).toBe("out_of_stock");
    expect(result.current.cartItems).toHaveLength(0);
  });

  it("updates quantity and caps it at stock", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(product, 1);
      result.current.updateQuantity(1, 99);
    });

    expect(result.current.cartItems[0].quantity).toBe(5);
  });

  it("removes an item when its quantity is set to zero", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(product, 1);
      result.current.updateQuantity(1, 0);
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.cartCount).toBe(0);
  });

  it("removes an item by ID", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(product, 1);
      result.current.removeFromCart(1);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it("clears all items", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(product, 1);
      result.current.addToCart({ ...product, id: 2 }, 1);
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.cartCount).toBe(0);
  });

  it("persists cart changes to localStorage", async () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart(product, 2);
    });

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveLength(1);
      expect(stored[0].quantity).toBe(2);
    });
  });

  it("restores valid items from localStorage", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 1,
          name: "Saved Product",
          price: 25,
          quantity: 2,
          stock: 5,
        },
      ])
    );

    const { result } = renderHook(() => useCart());

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].name).toBe("Saved Product");
    expect(result.current.cartCount).toBe(2);
    expect(result.current.cartTotal).toBe(50);
  });

  it("ignores invalid saved cart data", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify("not a cart"));

    const { result } = renderHook(() => useCart());

    expect(result.current.cartItems).toEqual([]);
  });
});
