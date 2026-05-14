<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Http\Requests\Cart\UpdateCartRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(protected CartService $cartService) {}

    /**
     * GET /api/v1/buyer/cart
     */
    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request->user());
        return $this->successResponse(new CartResource($cart));
    }

    /**
     * POST /api/v1/buyer/cart
     */
    public function addItem(AddToCartRequest $request): JsonResponse
    {
        $cart = $this->cartService->addItem(
            $request->user(),
            $request->product_id,
            $request->quantity
        );
        return $this->successResponse(new CartResource($cart), 'Item added to cart.', 201);
    }

    /**
     * PUT /api/v1/buyer/cart/{cartItemId}
     */
    public function updateItem(UpdateCartRequest $request, int $cartItemId): JsonResponse
    {
        $cart = $this->cartService->updateItem($request->user(), $cartItemId, $request->quantity);
        return $this->successResponse(new CartResource($cart), 'Cart updated.');
    }

    /**
     * DELETE /api/v1/buyer/cart/{cartItemId}
     */
    public function removeItem(Request $request, int $cartItemId): JsonResponse
    {
        $cart = $this->cartService->removeItem($request->user(), $cartItemId);
        return $this->successResponse(new CartResource($cart), 'Item removed from cart.');
    }
}
