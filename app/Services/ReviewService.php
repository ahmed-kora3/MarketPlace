<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;

class ReviewService
{
    /**
     * Add a review to a product.
     * Enforce: one review per user per product.
     */
    public function addReview(User $buyer, int $productId, array $data): Review
    {
        $product = Product::findOrFail($productId);

        $alreadyReviewed = Review::where('product_id', $productId)
            ->where('buyer_id', $buyer->id)
            ->exists();

        if ($alreadyReviewed) {
            throw new HttpResponseException(
                response()->json([
                    'status'  => 'Error',
                    'message' => 'You have already reviewed this product.',
                    'data'    => null,
                ], 422)
            );
        }

        return Review::create([
            'product_id' => $productId,
            'buyer_id'   => $buyer->id,
            'rating'     => $data['rating'],
            'comment'    => $data['comment'] ?? null,
        ]);
    }

    /**
     * Get paginated reviews for a product.
     */
    public function getProductReviews(int $productId, int $perPage = 10)
    {
        Product::findOrFail($productId);

        return Review::with('buyer')
            ->where('product_id', $productId)
            ->latest()
            ->paginate($perPage);
    }
}
