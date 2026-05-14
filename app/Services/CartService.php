<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;

class CartService
{
    /**
     * Get or create the user's cart.
     */
    public function getCart(User $user): Cart
    {
        return Cart::with(['items.product.category'])->firstOrCreate(
            ['buyer_id' => $user->id]
        );
    }

    /**
     * Add a product to the cart (or increase quantity).
     */
    public function addItem(User $user, int $productId, int $quantity): Cart
    {
        $product = Product::where('id', $productId)
            ->where('is_archived', false)
            ->where('stock', '>', 0)
            ->firstOrFail();

        $cart = Cart::firstOrCreate(['buyer_id' => $user->id]);

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $quantity);
        } else {
            CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $productId,
                'quantity'   => $quantity,
            ]);
        }

        return $cart->load(['items.product.category']);
    }

    /**
     * Update quantity of a cart item.
     */
    public function updateItem(User $user, int $cartItemId, int $quantity): Cart
    {
        $cart = Cart::where('buyer_id', $user->id)->firstOrFail();
        $item = CartItem::where('id', $cartItemId)
            ->where('cart_id', $cart->id)
            ->firstOrFail();

        $item->update(['quantity' => $quantity]);

        return $cart->load(['items.product.category']);
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(User $user, int $cartItemId): Cart
    {
        $cart = Cart::where('buyer_id', $user->id)->firstOrFail();
        CartItem::where('id', $cartItemId)->where('cart_id', $cart->id)->delete();
        return $cart->load(['items.product.category']);
    }

    /**
     * Clear all items in the user's cart.
     */
    public function clearCart(User $user): void
    {
        $cart = Cart::where('buyer_id', $user->id)->first();
        $cart?->items()->delete();
    }
}
