<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Exceptions\HttpResponseException;

class OrderService
{
    public function __construct(protected CartService $cartService) {}

    /**
     * Create an order from the user's cart.
     * Uses a DB transaction to ensure data integrity.
     */
    public function checkout(User $user): Order
    {
        $cart = Cart::with(['items.product'])->where('buyer_id', $user->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            throw new HttpResponseException(
                response()->json([
                    'status'  => 'Error',
                    'message' => 'Your cart is empty.',
                    'data'    => null,
                ], 422)
            );
        }

        return DB::transaction(function () use ($cart, $user) {
            $total = 0;
            $orderItemsData = [];

            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;

                // Check stock availability
                if ($product->stock < $cartItem->quantity) {
                    throw new HttpResponseException(
                        response()->json([
                            'status'  => 'Error',
                            'message' => "Product '{$product->name}' has insufficient stock.",
                            'data'    => null,
                        ], 422)
                    );
                }

                // Snapshot the price at time of purchase
                $lineTotal = $product->price * $cartItem->quantity;
                $total += $lineTotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'price'      => $product->price,
                    'quantity'   => $cartItem->quantity,
                ];

                // Decrement product stock
                $product->decrement('stock', $cartItem->quantity);
            }

            // Create the order
            $order = Order::create([
                'buyer_id'     => $user->id,
                'total_amount' => $total,
                'status'       => 'pending',
            ]);

            // Create order items
            $order->items()->createMany($orderItemsData);

            // Clear the cart after successful checkout
            $this->cartService->clearCart($user);

            return $order->load(['items.product', 'buyer']);
        });
    }

    /**
     * Get all orders for a buyer.
     */
    public function getBuyerOrders(User $user)
    {
        return Order::with(['items.product'])
            ->where('buyer_id', $user->id)
            ->latest()
            ->paginate(10);
    }

    /**
     * Get a single order (with policy check).
     */
    public function getOrder(int $orderId, User $user): Order
    {
        $order = Order::with(['items.product', 'buyer'])->findOrFail($orderId);

        if ($user->role !== 'admin' && $order->buyer_id !== $user->id) {
            throw new HttpResponseException(
                response()->json([
                    'status'  => 'Error',
                    'message' => 'Unauthorized.',
                    'data'    => null,
                ], 403)
            );
        }

        return $order;
    }
}
