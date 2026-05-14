<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orderService) {}

    /**
     * POST /api/v1/buyer/orders/checkout
     * Buyer: Create order from cart.
     */
    public function checkout(Request $request): JsonResponse
    {
        $order = $this->orderService->checkout($request->user());
        return $this->successResponse(new OrderResource($order), 'Order placed successfully.', 201);
    }

    /**
     * GET /api/v1/buyer/orders
     * Buyer: Get their orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderService->getBuyerOrders($request->user());
        return $this->successResponse(OrderResource::collection($orders));
    }

    /**
     * GET /api/v1/buyer/orders/{id}
     * Buyer: Get a specific order.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $order = $this->orderService->getOrder($id, $request->user());
        return $this->successResponse(new OrderResource($order));
    }
}
