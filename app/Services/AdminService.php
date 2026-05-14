<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminService
{
    /**
     * Get aggregated statistics for the admin dashboard.
     */
    public function getDashboardStats(): array
    {
        $totalUsers    = User::count();
        $totalSales    = Order::where('status', '!=', 'cancelled')->sum('total_amount');
        $totalOrders   = Order::count();
        $totalSellers  = User::where('role', 'seller')->count();
        $totalBuyers   = User::where('role', 'buyer')->count();

        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->with('product:id,name,price')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $topSellers = User::where('role', 'seller')
            ->withSum(['products as total_revenue' => function ($query) {
                $query->join('order_items', 'products.id', '=', 'order_items.product_id')
                      ->join('orders', 'order_items.order_id', '=', 'orders.id')
                      ->where('orders.status', '!=', 'cancelled');
            }], DB::raw('order_items.price * order_items.quantity'))
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get(['id', 'name', 'email']);

        return [
            'total_users'   => $totalUsers,
            'total_sellers' => $totalSellers,
            'total_buyers'  => $totalBuyers,
            'total_orders'  => $totalOrders,
            'total_sales'   => (float) $totalSales,
            'top_products'  => $topProducts,
            'top_sellers'   => $topSellers,
        ];
    }

    public function getAllOrders(int $perPage = 15)
    {
        return Order::with(['buyer', 'items.product'])
            ->latest()
            ->paginate($perPage);
    }

    public function updateOrderStatus(int $orderId, string $status): Order
    {
        $order = Order::findOrFail($orderId);
        $order->update(['status' => $status]);
        return $order->load(['buyer', 'items.product']);
    }

    /**
     * Confirm payment for an order (pending → paid).
     */
    public function confirmPayment(int $orderId): Order
    {
        $order = Order::findOrFail($orderId);

        if ($order->status !== 'pending') {
            throw new \Exception("Order #{$orderId} is not in pending state (current: {$order->status}).");
        }

        $order->update(['status' => 'paid']);
        return $order->load(['buyer', 'items.product']);
    }

    /**
     * Flag an order as payment failed/problematic (pending → payment_failed).
     */
    public function flagPaymentFailed(int $orderId, string $reason = null): Order
    {
        $order = Order::findOrFail($orderId);
        $order->update(['status' => 'payment_failed']);
        return $order->load(['buyer', 'items.product']);
    }
}
