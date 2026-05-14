<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(protected AdminService $adminService) {}

    /**
     * GET /api/v1/admin/dashboard
     * Admin: Get aggregated statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = $this->adminService->getDashboardStats();
        return $this->successResponse($stats, 'Dashboard statistics fetched.');
    }

    /**
     * GET /api/v1/admin/orders
     * Admin: Get all orders.
     */
    public function orders(): JsonResponse
    {
        $orders = $this->adminService->getAllOrders();
        return $this->successResponse(OrderResource::collection($orders));
    }

    /**
     * PATCH /api/v1/admin/orders/{id}/status
     * Admin: Update order status.
     */
    public function updateOrderStatus(Request $request, int $orderId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,paid,payment_failed,processing,shipped,delivered,cancelled',
        ]);

        $order = $this->adminService->updateOrderStatus($orderId, $request->status);
        return $this->successResponse(new OrderResource($order), 'Order status updated.');
    }

    /**
     * POST /api/v1/admin/orders/{id}/confirm-payment
     * Admin: Confirm payment for a pending order.
     */
    public function confirmPayment(int $orderId): JsonResponse
    {
        try {
            $order = $this->adminService->confirmPayment($orderId);
            return $this->successResponse(new OrderResource($order), '✅ Payment confirmed successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * POST /api/v1/admin/orders/{id}/flag-payment
     * Admin: Flag payment as failed/problematic.
     */
    public function flagPaymentFailed(int $orderId): JsonResponse
    {
        $order = $this->adminService->flagPaymentFailed($orderId);
        return $this->successResponse(new OrderResource($order), '⚠️ Order flagged as payment failed.');
    }
}
