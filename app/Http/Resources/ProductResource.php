<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'price'       => (float) $this->price,
            'stock'       => $this->stock,
            'is_archived' => $this->is_archived,
            'seller'      => new UserResource($this->whenLoaded('seller')),
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'reviews_count' => $this->whenCounted('reviews'),
            'avg_rating'  => $this->when(
                $this->relationLoaded('reviews'),
                fn() => round($this->reviews->avg('rating'), 1)
            ),
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
