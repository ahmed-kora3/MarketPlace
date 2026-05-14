<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(protected ReviewService $reviewService) {}

    /**
     * GET /api/v1/products/{productId}/reviews
     * Public: Get all reviews for a product.
     */
    public function index(int $productId): JsonResponse
    {
        $reviews = $this->reviewService->getProductReviews($productId);
        return $this->successResponse(ReviewResource::collection($reviews));
    }

    /**
     * POST /api/v1/products/{productId}/reviews
     * Buyer only: Add a review to a product.
     */
    public function store(StoreReviewRequest $request, int $productId): JsonResponse
    {
        $this->authorize('create', \App\Models\Review::class);

        $review = $this->reviewService->addReview(
            $request->user(),
            $productId,
            $request->validated()
        );

        return $this->successResponse(new ReviewResource($review), 'Review added.', 201);
    }
}
